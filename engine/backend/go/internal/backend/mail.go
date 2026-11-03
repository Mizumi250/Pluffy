package backend

import (
	"bytes"
	"encoding/base64"
	"fmt"
	"html/template"
	"log"
	"mime"
	"net"
	"net/mail"
	"net/smtp"
	"strconv"
	"strings"
)

type mailDefinition struct {
	name     string
	subject  string
	template string
}

func mailDefinitions(registration Registration) (map[string]mailDefinition, error) {
	definitions := make(map[string]mailDefinition)
	for _, section := range parseRealtimeSections(registration.Mails) {
		if _, exists := definitions[section.name]; exists {
			return nil, fmt.Errorf("duplicate mail definition %q", section.name)
		}
		definition := mailDefinition{name: section.name, subject: section.values["subject"]}
		if encoded := strings.TrimSpace(section.values["blade_body"]); encoded != "" {
			body, err := base64.StdEncoding.DecodeString(encoded)
			if err != nil {
				return nil, fmt.Errorf("decode template for mail %q: %w", section.name, err)
			}
			definition.template = string(body)
		}
		if definition.subject == "" {
			definition.subject = section.name
		}
		if definition.template == "" {
			definition.template = "<h2>{{.Subject}}</h2>"
		}
		definitions[section.name] = definition
	}
	return definitions, nil
}

func renderMail(definition mailDefinition, data map[string]any) (string, error) {
	parsed, err := template.New(definition.name).Parse(definition.template)
	if err != nil {
		return "", fmt.Errorf("parse mail template %q: %w", definition.name, err)
	}
	values := make(map[string]any, len(data)+1)
	for key, value := range data {
		values[key] = value
	}
	values["Subject"] = definition.subject
	var rendered bytes.Buffer
	if err := parsed.Execute(&rendered, values); err != nil {
		return "", fmt.Errorf("render mail template %q: %w", definition.name, err)
	}
	return rendered.String(), nil
}

func sendRenderedMail(to, subject, htmlBody string) error {
	switch strings.ToLower(envOr("MAIL_MAILER", "log")) {
	case "log":
		log.Printf("[mail:log] to=%s subject=%q", to, subject)
		return nil
	case "smtp":
		return sendSMTPMail(to, subject, htmlBody)
	default:
		return fmt.Errorf("unsupported MAIL_MAILER %q", envOr("MAIL_MAILER", "log"))
	}
}

func sendSMTPMail(to, subject, htmlBody string) error {
	toAddress, err := mail.ParseAddress(to)
	if err != nil || toAddress.Address != to {
		return fmt.Errorf("invalid recipient email address")
	}
	from := envOr("MAIL_FROM_ADDRESS", "hello@example.com")
	fromAddress, err := mail.ParseAddress(from)
	if err != nil {
		return fmt.Errorf("invalid MAIL_FROM_ADDRESS: %w", err)
	}
	host := envOr("MAIL_HOST", "127.0.0.1")
	portText := envOr("MAIL_PORT", "587")
	port, err := strconv.Atoi(portText)
	if err != nil || port < 1 || port > 65535 {
		return fmt.Errorf("MAIL_PORT must be an integer from 1 to 65535")
	}
	if strings.ContainsAny(subject, "\r\n") {
		return fmt.Errorf("mail subject contains invalid header characters")
	}
	message := strings.Join([]string{
		"From: " + fromAddress.String(),
		"To: " + toAddress.String(),
		"Subject: " + mime.QEncoding.Encode("UTF-8", subject),
		"MIME-Version: 1.0",
		"Content-Type: text/html; charset=UTF-8",
		"Content-Transfer-Encoding: 8bit",
		"",
		htmlBody,
	}, "\r\n")
	var auth smtp.Auth
	if username := strings.TrimSpace(getenv("MAIL_USERNAME")); username != "" {
		auth = smtp.PlainAuth("", username, getenv("MAIL_PASSWORD"), host)
	}
	if err := smtp.SendMail(net.JoinHostPort(host, strconv.Itoa(port)), auth, fromAddress.Address, []string{toAddress.Address}, []byte(message)); err != nil {
		return fmt.Errorf("email delivery failed: %w", err)
	}
	return nil
}

func mailData(input map[string]any) (map[string]any, error) {
	raw, exists := input["data"]
	if !exists || raw == nil {
		return map[string]any{}, nil
	}
	data, ok := raw.(map[string]any)
	if !ok {
		return nil, fmt.Errorf(`Field "data" must be an object`)
	}
	return data, nil
}
