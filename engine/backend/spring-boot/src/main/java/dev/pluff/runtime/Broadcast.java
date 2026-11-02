package dev.pluff.runtime;

import org.java_websocket.WebSocket;
import org.java_websocket.handshake.ClientHandshake;
import org.java_websocket.server.WebSocketServer;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.InetSocketAddress;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.util.ArrayList;
import java.util.Base64;
import java.util.Collections;
import java.util.HashMap;
import java.util.HexFormat;
import java.util.HashSet;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ConcurrentHashMap;

/** Pusher/Reverb-compatible channel signing and WebSocket broadcast hub. */
public final class Broadcast {
  private Broadcast() {}

  public abstract static class Event {
    public String tatemono = "";
    public String channelType = "public";
    public String channel = "";
    public boolean channelHasId;
    public String eventName = "";
    public Object userId;
    public Map<String, Object> data = new LinkedHashMap<>();
  }

  private static final Set<WebSocket> clients = ConcurrentHashMap.newKeySet();
  private static final Map<String, Set<WebSocket>> channels = new ConcurrentHashMap<>();
  private static final Map<WebSocket, String> socketIds = new ConcurrentHashMap<>();
  private static final Map<WebSocket, Map<String, Map<String, Object>>> presence = new ConcurrentHashMap<>();
  private static volatile WebSocketServer server;

  private static String key() { return Support.env("REVERB_APP_KEY", "pluff-key"); }
  private static String secret() { return Support.env("REVERB_APP_SECRET", "pluff-secret"); }

  public static String signChannel(String socketId, String channel, String channelData) {
    String message = socketId + ":" + channel + (channelData == null ? "" : ":" + channelData);
    try {
      Mac mac = Mac.getInstance("HmacSHA256");
      mac.init(new SecretKeySpec(secret().getBytes(StandardCharsets.UTF_8), "HmacSHA256"));
      return key() + ":" + HexFormat.of().formatHex(mac.doFinal(message.getBytes(StandardCharsets.UTF_8)));
    } catch (java.security.GeneralSecurityException e) {
      throw new IllegalStateException("Cannot sign broadcast channel", e);
    }
  }

  private static void send(WebSocket socket, String event, Object data, String channel) {
    if (socket == null || !socket.isOpen()) return;
    Map<String, Object> message = new LinkedHashMap<>();
    message.put("event", event);
    if (channel != null) message.put("channel", channel);
    message.put("data", data instanceof String ? data : Json.stringify(data));
    socket.send(Json.stringify(message));
  }

  private static Map<String, Object> error(int code, String message) {
    return Support.mapOf("code", code, "message", message);
  }

  private static void subscribe(WebSocket socket, Map<String, Object> message) {
    String channel = String.valueOf(message.getOrDefault("channel", ""));
    boolean isPrivate = channel.startsWith("private-");
    boolean isPresence = channel.startsWith("presence-");
    Object channelData = message.get("channel_data");
    if (isPrivate || isPresence) {
      String expected = signChannel(socketIds.get(socket), channel,
          isPresence && channelData != null ? String.valueOf(channelData) : null);
      if (!MessageDigest.isEqual(expected.getBytes(StandardCharsets.UTF_8),
          String.valueOf(message.getOrDefault("auth", "")).getBytes(StandardCharsets.UTF_8))) {
        send(socket, "pusher:error", error(4009, "Connection is unauthorized"), channel);
        return;
      }
    }
    channels.computeIfAbsent(channel, ignored -> ConcurrentHashMap.newKeySet()).add(socket);
    if (isPresence) {
      Map<String, Object> info = Json.parseObject(String.valueOf(channelData));
      presence.computeIfAbsent(socket, ignored -> new ConcurrentHashMap<>()).put(channel, info);
      send(socket, "pusher_internal:subscription_succeeded", members(channel), channel);
      for (WebSocket other : channels.getOrDefault(channel, Collections.emptySet())) {
        if (other != socket) send(other, "pusher_internal:member_added", info, channel);
      }
    } else {
      send(socket, "pusher_internal:subscription_succeeded", Map.of(), channel);
    }
  }

  private static Map<String, Object> members(String channel) {
    List<String> ids = new ArrayList<>();
    Map<String, Object> hash = new LinkedHashMap<>();
    for (WebSocket socket : channels.getOrDefault(channel, Collections.emptySet())) {
      Map<String, Object> info = presence.getOrDefault(socket, Map.of()).get(channel);
      if (info == null) continue;
      String id = String.valueOf(info.get("user_id"));
      ids.add(id);
      hash.put(id, info.get("user_info"));
    }
    return Support.mapOf("presence", Support.mapOf("count", ids.size(), "ids", ids, "hash", hash));
  }

  private static void drop(WebSocket socket) {
    clients.remove(socket);
    socketIds.remove(socket);
    Map<String, Map<String, Object>> info = presence.remove(socket);
    if (info != null) {
      for (Map.Entry<String, Map<String, Object>> entry : info.entrySet()) {
        String channel = entry.getKey();
        channels.getOrDefault(channel, Collections.emptySet()).remove(socket);
        Object userId = entry.getValue().get("user_id");
        for (WebSocket other : channels.getOrDefault(channel, Collections.emptySet()))
          send(other, "pusher_internal:member_removed", Support.mapOf("user_id", userId), channel);
      }
    }
    for (Set<WebSocket> subscribers : channels.values()) subscribers.remove(socket);
    channels.entrySet().removeIf(entry -> entry.getValue().isEmpty());
  }

  public static void broadcastTo(String channel, String event, Object data, String exceptSocketId) {
    for (WebSocket socket : channels.getOrDefault(channel, Collections.emptySet())) {
      if (!String.valueOf(socketIds.get(socket)).equals(exceptSocketId))
        send(socket, event, data, channel);
    }
  }

  public static void broadcast(Event event) {
    String name;
    if ("public".equals(event.channelType)) name = event.channel;
    else if ("private".equals(event.channelType))
      name = "private-" + event.channel + (event.channelHasId && event.userId != null ? "." + event.userId : "");
    else name = event.channelType + "-" + event.channel;
    broadcastTo(name, event.eventName, event.data, null);
  }

  public static synchronized void start(int port) {
    if (server != null) return;
    server = new WebSocketServer(new InetSocketAddress(port)) {
      @Override public void onOpen(WebSocket socket, ClientHandshake handshake) {
        String socketId = Support.toLong(Math.random() * 1_000_000_000, 0) + "."
            + Support.toLong(Math.random() * 1_000_000_000, 0);
        clients.add(socket);
        socketIds.put(socket, socketId);
        send(socket, "pusher:connection_established",
            Support.mapOf("socket_id", socketId, "activity_timeout", 30), null);
      }

      @Override public void onMessage(WebSocket socket, String raw) {
        Map<String, Object> message = Json.parseObject(raw);
        String event = String.valueOf(message.get("event"));
        Map<String, Object> data = message.get("data") instanceof Map
            ? castMap(message.get("data")) : Json.parseObject(String.valueOf(message.get("data")));
        if ("pusher:ping".equals(event)) send(socket, "pusher:pong", Map.of(), null);
        else if ("pusher:subscribe".equals(event)) subscribe(socket, data);
        else if ("pusher:unsubscribe".equals(event)) {
          String channel = String.valueOf(data.get("channel"));
          channels.getOrDefault(channel, Collections.emptySet()).remove(socket);
        }
      }

      @Override public void onClose(WebSocket socket, int code, String reason, boolean remote) { drop(socket); }
      @Override public void onError(WebSocket socket, Exception error) {
        if (socket != null) Log.warn("Realtime socket error: " + error.getMessage());
        else Log.warn("Realtime server error: " + error.getMessage());
      }
      @Override public void onStart() { Log.info("Realtime (Pusher protocol) on :" + port); }
    };
    server.start();
  }

  @SuppressWarnings("unchecked")
  private static Map<String, Object> castMap(Object value) { return (Map<String, Object>) value; }
}
