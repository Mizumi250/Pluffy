#!/usr/bin/env python3
"""Generates validation-vectors.json, the shared validation conformance suite.

Each vector: {"rule": "<laravel rule string>", "value": <optional field value>, "data": <optional other fields>, "pass": bool}
The field under test is always named "field". Omit "value" to test a missing field.
Expected results follow Laravel semantics and the Express runtime (reference non-Laravel engine).
Rules deliberately NOT covered (unsupported everywhere): date_format, after*, before*, digits_between.
Rules NOT covered because they need I/O: unique, exists, file, image, mimes, mimetypes.
"""
import json, pathlib

V = []
def v(rule, ok, **kw):
    d = {"rule": rule, "pass": ok}
    d.update(kw)
    V.append(d)

NOVAL = object()
# --- presence
v("required", True, value="x"); v("required", False, value=""); v("required", False)
v("required", False, value=None); v("required|nullable", False, value=None)
v("nullable|string", True, value=None); v("nullable", True)
v("sometimes|required", True); v("sometimes|required", False, value="")
v("present", False); v("present", True, value=None)
v("filled", False, value=""); v("filled", True, value="x"); v("filled", True)
v("prohibited", False, value="x"); v("prohibited", True); v("prohibited", True, value="")
# --- types
v("string", True, value="a"); v("string", False, value=5)
for x in (5, "5", "-5"): v("integer", True, value=x)
for x in ("5.5", 5.5, True): v("integer", False, value=x)
for x in (5, "5.5", "-3"): v("numeric", True, value=x)
for x in ("abc", True): v("numeric", False, value=x)
for x in (True, False, 1, 0, "1", "0", "true", "false"): v("boolean", True, value=x)
for x in ("yes", 2): v("boolean", False, value=x)
for x in ("yes", "on", 1, "1", True, "true"): v("accepted", True, value=x)
for x in ("no", False, 0): v("accepted", False, value=x)
for x in ("no", "off", 0, "0", False, "false"): v("declined", True, value=x)
for x in ("yes", True): v("declined", False, value=x)
v("email", True, value="a@b.co"); v("email", False, value="a@b"); v("email", False, value="a b@c.co")
v("url", True, value="https://example.com/x"); v("url", True, value="mailto:a@b.co")
v("url", False, value="example.com"); v("url", False, value="http://")
v("array", True, value=[1]); v("array", True, value={"a": 1}); v("array", False, value="x")
v("date", True, value="2024-01-15"); v("date", True, value="2024-01-15T10:30:00Z")
v("date", True, value="2024-02-29"); v("date", False, value="not a date"); v("date", False, value="2024-13-40")
v("json", True, value='{"a":1}'); v("json", False, value="{bad")
v("uuid", True, value="123e4567-e89b-12d3-a456-426614174000"); v("uuid", False, value="123")
v("alpha", True, value="abC"); v("alpha", False, value="ab1")
v("alpha_num", True, value="ab1"); v("alpha_num", False, value="ab-1")
v("alpha_dash", True, value="ab-1_x"); v("alpha_dash", False, value="ab 1")
v("ip", True, value="127.0.0.1"); v("ip", True, value="::1"); v("ip", False, value="999.1.1.1")
v("ipv4", True, value="10.0.0.1"); v("ipv4", False, value="::1")
v("ipv6", True, value="::1"); v("ipv6", False, value="10.0.0.1")
v("lowercase", True, value="abc"); v("lowercase", False, value="aBc")
v("uppercase", True, value="ABC"); v("uppercase", False, value="AbC")
v("starts_with:ab,cd", True, value="abc"); v("starts_with:ab,cd", True, value="cdx"); v("starts_with:ab,cd", False, value="xyz")
v("ends_with:ab,cd", True, value="xab"); v("ends_with:ab,cd", False, value="xyz")
v("doesnt_start_with:ab", True, value="xab"); v("doesnt_start_with:ab", False, value="abx")
v("doesnt_end_with:ab", True, value="abx"); v("doesnt_end_with:ab", False, value="xab")
v("decimal:2", True, value="1.50"); v("decimal:2", False, value="1.5"); v("decimal:1,2", False, value="1.234"); v("decimal:1,2", True, value="1.23")
v("digits:3", True, value="123"); v("digits:3", True, value=123); v("digits:3", False, value="12"); v("digits:3", False, value="12a")
# --- size family
v("min:3", True, value="abc"); v("min:3", False, value="ab")
v("max:3", True, value="abc"); v("max:3", False, value="abcd")
v("numeric|min:3", True, value="5"); v("numeric|min:3", False, value="2")
v("max:5", False, value=6); v("max:5", True, value=5)
v("max:1", False, value=[1, 2]); v("max:2", True, value=[1, 2])
v("size:3", True, value="abc"); v("size:3", False, value="ab")
v("between:2,4", True, value="abc"); v("between:2,4", False, value="a"); v("between:2,4", False, value="abcde")
# --- comparison
v("gt:5", True, value=6); v("gt:5", False, value=5)
v("gte:5", True, value=5); v("gte:5", False, value=4)
v("lt:5", True, value=4); v("lt:5", False, value=5)
v("lte:5", True, value=5); v("lte:5", False, value=6)
v("gt:other", True, value=4, data={"other": 3}); v("gt:other", False, value=2, data={"other": 3})
v("lte:other", True, value=3, data={"other": 3})
v("in:a,b", True, value="a"); v("in:a,b", False, value="c"); v("in:1,2", True, value=1)
v("not_in:a,b", True, value="c"); v("not_in:a,b", False, value="a")
v("regex:/^a+$/", True, value="aaa"); v("regex:/^a+$/", False, value="b")
v("regex:/^a+$/i", True, value="AAA")
v("not_regex:/^a+$/", True, value="b"); v("not_regex:/^a+$/", False, value="aaa")
# --- cross field
v("confirmed", True, value="x", data={"field_confirmation": "x"})
v("confirmed", False, value="x", data={"field_confirmation": "y"})
v("confirmed", False, value="x")
v("same:other", True, value="a", data={"other": "a"}); v("same:other", False, value="b", data={"other": "a"})
v("different:other", True, value="b", data={"other": "a"}); v("different:other", False, value="a", data={"other": "a"})
v("required_if:other,yes", False, data={"other": "yes"}); v("required_if:other,yes", True, data={"other": "no"})
v("required_if:other,yes", True, value="x", data={"other": "yes"})
v("required_unless:other,yes", True, data={"other": "yes"}); v("required_unless:other,yes", False, data={"other": "no"})
v("required_with:other", False, data={"other": "x"}); v("required_with:other", True)
v("required_with_all:a,b", False, data={"a": 1, "b": 2}); v("required_with_all:a,b", True, data={"a": 1})
v("required_without:other", False); v("required_without:other", True, data={"other": "x"})
v("required_without_all:a,b", False); v("required_without_all:a,b", True, data={"a": 1})
v("prohibited_if:other,yes", False, value="x", data={"other": "yes"}); v("prohibited_if:other,yes", True, value="x", data={"other": "no"})
v("prohibited_unless:other,yes", False, value="x", data={"other": "no"}); v("prohibited_unless:other,yes", True, value="x", data={"other": "yes"})
v("accepted_if:other,yes", False, value="no", data={"other": "yes"})
v("accepted_if:other,yes", True, value="yes", data={"other": "yes"})
v("accepted_if:other,yes", True, value="no", data={"other": "no"})
v("accepted_if:other,yes", False, data={"other": "yes"})
# --- combined
v("required|string|max:5", False, value="abcdef"); v("required|string|max:5", True, value="abc")
v("bail|required|min:5|email", False, value="ab")

pathlib.Path(__file__).with_name("validation-vectors.json").write_text(json.dumps(V, indent=1) + "\n")
print(len(V), "vectors")
