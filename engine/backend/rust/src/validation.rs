// Laravel-style validation for the Rust engine.
//
// Mirrors the rule set and messages of the Express runtime (`express/src/runtime/validation.ts`),
// which is the most complete non-Laravel implementation. Rules that need the database
// (`unique`, `exists`) are evaluated in `api.rs`; here they are accepted and skipped.
//
// Explicitly NOT supported (shared gap across every non-Laravel backend, documented in
// BACKEND_PARITY_CHECKLIST.md): date_format, after, before, after_or_equal, before_or_equal,
// digits_between. An endpoint that uses one of them is reported as unsupported at build time
// instead of validating silently.
use regex::Regex;
use serde_json::{Map, Value};
use std::net::{Ipv4Addr, Ipv6Addr};
use std::sync::OnceLock;

/// Rules that never take an argument.
const NO_ARGUMENT: &[&str] = &[
    "required", "nullable", "sometimes", "bail", "filled", "present", "prohibited", "string",
    "integer", "numeric", "boolean", "array", "email", "url", "json", "uuid", "alpha", "alpha_num",
    "alpha_dash", "ip", "ipv4", "ipv6", "accepted", "declined", "date", "lowercase", "uppercase",
    "file", "image",
];

/// Rules whose argument is optional or free-form.
const OPTIONAL_ARGUMENT: &[&str] = &["confirmed", "distinct", "unique", "exists"];

/// Rules that need a non-empty argument list.
const WITH_ARGUMENT: &[&str] = &[
    "min", "max", "size", "between", "digits", "decimal", "in", "not_in", "same", "different",
    "starts_with", "ends_with", "doesnt_start_with", "doesnt_end_with", "regex", "not_regex", "gt",
    "gte", "lt", "lte", "required_if", "required_unless", "required_with", "required_with_all",
    "required_without", "required_without_all", "prohibited_if", "prohibited_unless", "accepted_if",
    "mimes", "mimetypes",
];

/// Rules that only decide whether a missing value is an error; they are never "checked" against a value.
const PRESENCE_RULES: &[&str] = &[
    "required", "nullable", "sometimes", "bail", "filled", "present", "required_if",
    "required_unless", "required_with", "required_with_all", "required_without",
    "required_without_all", "prohibited", "prohibited_if", "prohibited_unless",
];

struct Rule<'a> {
    name: &'a str,
    raw: &'a str,
    args: Vec<&'a str>,
}

fn parse(rule_set: &str) -> Vec<Rule<'_>> {
    rule_set
        .split('|')
        .map(str::trim)
        .filter(|rule| !rule.is_empty())
        .map(|rule| match rule.split_once(':') {
            Some((name, raw)) => Rule {
                name,
                raw,
                args: raw.split(',').collect(),
            },
            None => Rule {
                name: rule,
                raw: "",
                args: Vec::new(),
            },
        })
        .collect()
}

fn re(cell: &'static OnceLock<Regex>, pattern: &str) -> &'static Regex {
    cell.get_or_init(|| Regex::new(pattern).expect("static regex"))
}

fn email_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
}
fn uuid_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(
        &CELL,
        r"(?i)^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$",
    )
}
fn alpha_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"^[A-Za-z]+$")
}
fn alpha_num_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"^[A-Za-z0-9]+$")
}
fn alpha_dash_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"^[A-Za-z0-9_-]+$")
}
fn int_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"^-?\d+$")
}
fn url_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"^[A-Za-z][A-Za-z0-9+.\-]*:[^\s]+$")
}
fn http_url_re() -> &'static Regex {
    static CELL: OnceLock<Regex> = OnceLock::new();
    re(&CELL, r"(?i)^https?://[^/\s?#]+")
}

/// Parses a Laravel-style `/pattern/flags` argument into a compiled regex.
fn compile_pattern(raw: &str) -> Option<Regex> {
    let raw = raw.trim();
    let rest = raw.strip_prefix('/')?;
    let end = rest.rfind('/')?;
    let (pattern, flags) = (&rest[..end], &rest[end + 1..]);
    if !flags.chars().all(|flag| matches!(flag, 'i' | 'm' | 's' | 'u' | 'x')) {
        return None;
    }
    let inline: String = flags.chars().filter(|flag| *flag != 'u').collect();
    let full = if inline.is_empty() {
        pattern.to_owned()
    } else {
        format!("(?{inline}){pattern}")
    };
    Regex::new(&full).ok()
}

fn is_number(text: &str) -> bool {
    text.trim().parse::<f64>().is_ok()
}

/// True when `rule_set` only uses rules this engine can evaluate with valid arguments.
pub fn rule_set_supported(rule_set: &str) -> bool {
    parse(rule_set).iter().all(|rule| rule_supported(rule))
}

fn rule_supported(rule: &Rule<'_>) -> bool {
    let name = rule.name;
    if NO_ARGUMENT.contains(&name) {
        return rule.raw.is_empty();
    }
    if OPTIONAL_ARGUMENT.contains(&name) {
        return true;
    }
    if !WITH_ARGUMENT.contains(&name) {
        return false;
    }
    if rule.raw.is_empty() {
        return false;
    }
    match name {
        "min" | "max" | "size" => rule.args.len() == 1 && is_number(rule.args[0]),
        "between" => rule.args.len() == 2 && rule.args.iter().all(|arg| is_number(arg)),
        "digits" => rule.args.len() == 1 && rule.args[0].trim().parse::<usize>().is_ok(),
        "decimal" => {
            !rule.args.is_empty()
                && rule.args.len() <= 2
                && rule.args.iter().all(|arg| arg.trim().parse::<usize>().is_ok())
        }
        "in" | "not_in" => rule.args.iter().all(|option| !option.is_empty()),
        "regex" | "not_regex" => compile_pattern(rule.raw).is_some(),
        "required_if" | "required_unless" | "prohibited_if" | "prohibited_unless" | "accepted_if" => {
            rule.args.len() >= 2
        }
        _ => true,
    }
}

// ---------------------------------------------------------------------------------------------
// value helpers

pub fn get_path<'a>(body: &'a Map<String, Value>, path: &str) -> Option<&'a Value> {
    let mut parts = path.split('.');
    let mut current = body.get(parts.next()?)?;
    for part in parts {
        current = match current {
            Value::Object(map) => map.get(part)?,
            Value::Array(items) => items.get(part.parse::<usize>().ok()?)?,
            _ => return None,
        };
    }
    Some(current)
}

fn is_empty(value: Option<&Value>) -> bool {
    match value {
        None | Some(Value::Null) => true,
        Some(Value::String(text)) => text.trim().is_empty(),
        Some(Value::Array(items)) => items.is_empty(),
        _ => false,
    }
}

fn text_of(value: &Value) -> String {
    match value {
        Value::String(text) => text.clone(),
        Value::Null => String::new(),
        other => other.to_string(),
    }
}

fn number_of(value: &Value) -> Option<f64> {
    match value {
        Value::Number(number) => number.as_f64(),
        Value::String(text) if !text.trim().is_empty() => text.trim().parse::<f64>().ok(),
        _ => None,
    }
}

fn size_of(value: &Value, numeric: bool) -> f64 {
    if let Value::Number(number) = value {
        return number.as_f64().unwrap_or(0.0);
    }
    if numeric {
        if let Some(number) = number_of(value) {
            return number;
        }
    }
    match value {
        Value::Array(items) => items.len() as f64,
        other => text_of(other).chars().count() as f64,
    }
}

fn attribute(field: &str) -> String {
    field.replace(".*", "").replace(['_', '.'], " ")
}

fn is_valid_date(text: &str) -> bool {
    static CELL: OnceLock<Regex> = OnceLock::new();
    let date = re(
        &CELL,
        r"^(\d{4})-(\d{2})-(\d{2})(?:[T ](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$",
    );
    let Some(captures) = date.captures(text.trim()) else {
        return false;
    };
    let number = |index: usize| {
        captures
            .get(index)
            .and_then(|part| part.as_str().parse::<u32>().ok())
    };
    let (Some(year), Some(month), Some(day)) = (number(1), number(2), number(3)) else {
        return false;
    };
    let leap = (year % 4 == 0 && year % 100 != 0) || year % 400 == 0;
    let days = match month {
        1 | 3 | 5 | 7 | 8 | 10 | 12 => 31,
        4 | 6 | 9 | 11 => 30,
        2 if leap => 29,
        2 => 28,
        _ => return false,
    };
    day >= 1
        && day <= days
        && number(4).map_or(true, |hour| hour < 24)
        && number(5).map_or(true, |minute| minute < 60)
        && number(6).map_or(true, |second| second < 60)
}

fn dependency_is(rule: &Rule<'_>, body: &Map<String, Value>) -> bool {
    let Some(field) = rule.args.first() else {
        return false;
    };
    let actual = get_path(body, field).map(text_of).unwrap_or_default();
    rule.args.iter().skip(1).any(|expected| *expected == actual)
}

fn dependencies_present(rule: &Rule<'_>, body: &Map<String, Value>) -> Vec<bool> {
    rule.args
        .iter()
        .map(|field| !is_empty(get_path(body, field)))
        .collect()
}

// ---------------------------------------------------------------------------------------------
// messages

fn size_message(rule: &str, value: &Value, numeric: bool, field: &str, args: &[&str]) -> String {
    let unit = match value {
        Value::Array(_) => " items",
        Value::Number(_) => "",
        _ if numeric => "",
        _ => " characters",
    };
    let name = attribute(field);
    match rule {
        "min" => format!("The {name} field must be at least {}{unit}.", args[0]),
        "max" => format!("The {name} field must not be greater than {}{unit}.", args[0]),
        "size" => format!("The {name} field must be {}{unit}.", args[0]),
        _ => format!(
            "The {name} field must be between {} and {}{unit}.",
            args[0], args[1]
        ),
    }
}

fn fail_message(rule: &str, field: &str) -> String {
    let name = attribute(field);
    match rule {
        "string" => format!("The {name} field must be a string."),
        "integer" => format!("The {name} field must be an integer."),
        "numeric" => format!("The {name} field must be a number."),
        "boolean" => format!("The {name} field must be true or false."),
        "email" => format!("The {name} field must be a valid email address."),
        "url" => format!("The {name} field must be a valid URL."),
        "array" => format!("The {name} field must be an array."),
        "date" => format!("The {name} field must be a valid date."),
        "json" => format!("The {name} field must be a valid JSON string."),
        "uuid" => format!("The {name} field must be a valid UUID."),
        "alpha" => format!("The {name} field must only contain letters."),
        "alpha_num" => format!("The {name} field must only contain letters and numbers."),
        "alpha_dash" => format!(
            "The {name} field must only contain letters, numbers, dashes, and underscores."
        ),
        "in" | "not_in" | "exists" => format!("The selected {name} is invalid."),
        "unique" => format!("The {name} has already been taken."),
        "regex" | "not_regex" => format!("The {name} field format is invalid."),
        "confirmed" => format!("The {name} field confirmation does not match."),
        "accepted" => format!("The {name} field must be accepted."),
        "declined" => format!("The {name} field must be declined."),
        "ip" => format!("The {name} field must be a valid IP address."),
        "ipv4" => format!("The {name} field must be a valid IPv4 address."),
        "ipv6" => format!("The {name} field must be a valid IPv6 address."),
        "distinct" => format!("The {name} field has a duplicate value."),
        "lowercase" => format!("The {name} field must be lowercase."),
        "uppercase" => format!("The {name} field must be uppercase."),
        "decimal" => format!("The {name} field must have the specified number of decimal places."),
        _ => format!("The {name} field is invalid."),
    }
}

// ---------------------------------------------------------------------------------------------
// evaluation

/// Expands `items.*.name` style keys against the request body (same behaviour as Express).
pub fn expand_keys(rules: &Map<String, Value>, body: &Map<String, Value>) -> Vec<(String, String)> {
    let mut out = Vec::new();
    for (key, rule) in rules {
        let Some(rule) = rule.as_str() else { continue };
        if !key.contains('*') {
            out.push((key.clone(), rule.to_owned()));
            continue;
        }
        let parts: Vec<&str> = key.split('.').collect();
        let mut stack: Vec<(String, usize, Option<&Value>)> = vec![(String::new(), 0, None)];
        let root = Value::Object(body.clone());
        stack[0].2 = Some(&root);
        let mut resolved: Vec<String> = Vec::new();
        while let Some((prefix, index, current)) = stack.pop() {
            if index == parts.len() {
                resolved.push(prefix);
                continue;
            }
            let part = parts[index];
            let join = |next: &str| {
                if prefix.is_empty() {
                    next.to_owned()
                } else {
                    format!("{prefix}.{next}")
                }
            };
            if part == "*" {
                if let Some(Value::Array(items)) = current {
                    for (position, item) in items.iter().enumerate().rev() {
                        stack.push((join(&position.to_string()), index + 1, Some(item)));
                    }
                }
            } else {
                let next = current.and_then(|value| value.get(part));
                stack.push((join(part), index + 1, next));
            }
        }
        for path in resolved {
            out.push((path, rule.to_owned()));
        }
    }
    out
}

/// Validates one field. Returns every failure message (empty = valid).
pub fn validate_field(
    field: &str,
    value: Option<&Value>,
    rule_set: &str,
    body: &Map<String, Value>,
) -> Vec<String> {
    let rules = parse(rule_set);
    let has = |name: &str| rules.iter().any(|rule| rule.name == name);
    let name = attribute(field);

    if has("sometimes") && value.is_none() {
        return Vec::new();
    }
    if has("present") && value.is_none() {
        return vec![format!("The {name} field must be present.")];
    }
    let missing = is_empty(value);
    let prohibited = has("prohibited")
        || rules
            .iter()
            .any(|rule| rule.name == "prohibited_if" && dependency_is(rule, body))
        || rules
            .iter()
            .any(|rule| rule.name == "prohibited_unless" && !dependency_is(rule, body));
    if prohibited && !missing {
        return vec![format!("The {name} field is prohibited.")];
    }

    let find = |rule_name: &str| rules.iter().find(|rule| rule.name == rule_name);
    let accepted_if = rules
        .iter()
        .find(|rule| rule.name == "accepted_if" && dependency_is(rule, body));
    let must_have = has("required")
        || find("required_if").is_some_and(|rule| dependency_is(rule, body))
        || find("required_unless").is_some_and(|rule| !dependency_is(rule, body))
        || find("required_with").is_some_and(|rule| {
            dependencies_present(rule, body).into_iter().any(|present| present)
        })
        || find("required_with_all").is_some_and(|rule| {
            dependencies_present(rule, body).into_iter().all(|present| present)
        })
        || find("required_without").is_some_and(|rule| {
            dependencies_present(rule, body).into_iter().any(|present| !present)
        })
        || find("required_without_all").is_some_and(|rule| {
            dependencies_present(rule, body).into_iter().all(|present| !present)
        })
        || accepted_if.is_some();

    if missing {
        if must_have {
            return vec![format!("The {name} field is required.")];
        }
        if has("filled") && value.is_some() {
            return vec![format!("The {name} field must have a value.")];
        }
        return Vec::new();
    }
    let Some(value) = value else {
        return Vec::new();
    };

    let numeric = has("numeric") || has("integer");
    let mut errors = Vec::new();
    for rule in &rules {
        if PRESENCE_RULES.contains(&rule.name) {
            continue;
        }
        let effective = if rule.name == "accepted_if" {
            if accepted_if.is_none() {
                continue;
            }
            "accepted"
        } else {
            rule.name
        };
        if let Some(message) = check(effective, rule, value, field, body, numeric) {
            errors.push(message);
            if has("bail") {
                break;
            }
        }
    }
    errors
}

fn check(
    name: &str,
    rule: &Rule<'_>,
    value: &Value,
    field: &str,
    body: &Map<String, Value>,
    numeric: bool,
) -> Option<String> {
    let args = &rule.args;
    let text = text_of(value);
    let ok = match name {
        "string" => value.is_string(),
        "integer" => match value {
            Value::Number(number) => {
                number.is_i64() || number.is_u64() || number.as_f64().is_some_and(|n| n.fract() == 0.0)
            }
            Value::String(text) => int_re().is_match(text),
            _ => false,
        },
        "numeric" => !value.is_boolean() && number_of(value).is_some(),
        "boolean" => match value {
            Value::Bool(_) => true,
            Value::Number(number) => matches!(number.as_i64(), Some(0 | 1)),
            Value::String(text) => matches!(text.as_str(), "0" | "1" | "true" | "false"),
            _ => false,
        },
        "accepted" => match value {
            Value::Bool(flag) => *flag,
            Value::Number(number) => number.as_i64() == Some(1),
            Value::String(text) => matches!(text.as_str(), "yes" | "on" | "1" | "true"),
            _ => false,
        },
        "declined" => match value {
            Value::Bool(flag) => !*flag,
            Value::Number(number) => number.as_i64() == Some(0),
            Value::String(text) => matches!(text.as_str(), "no" | "off" | "0" | "false"),
            _ => false,
        },
        "email" => email_re().is_match(&text),
        "url" => {
            url_re().is_match(&text)
                && (!text.to_ascii_lowercase().starts_with("http")
                    || http_url_re().is_match(&text))
        }
        "array" => value.is_array() || value.is_object(),
        "date" => is_valid_date(&text),
        "json" => serde_json::from_str::<Value>(&text).is_ok(),
        "uuid" => uuid_re().is_match(&text),
        "alpha" => alpha_re().is_match(&text),
        "alpha_num" => alpha_num_re().is_match(&text),
        "alpha_dash" => alpha_dash_re().is_match(&text),
        "ip" => text.parse::<Ipv4Addr>().is_ok() || text.parse::<Ipv6Addr>().is_ok(),
        "ipv4" => text.parse::<Ipv4Addr>().is_ok(),
        "ipv6" => text.parse::<Ipv6Addr>().is_ok(),
        "lowercase" => text == text.to_lowercase(),
        "uppercase" => text == text.to_uppercase(),
        "starts_with" => args.iter().any(|prefix| text.starts_with(prefix)),
        "ends_with" => args.iter().any(|suffix| text.ends_with(suffix)),
        "doesnt_start_with" => !args.iter().any(|prefix| text.starts_with(prefix)),
        "doesnt_end_with" => !args.iter().any(|suffix| text.ends_with(suffix)),
        "decimal" => {
            if number_of(value).is_none() {
                false
            } else {
                let places = text.split_once('.').map_or(0, |(_, decimals)| decimals.len());
                let minimum = args[0].trim().parse::<usize>().unwrap_or(0);
                let maximum = args.get(1).and_then(|max| max.trim().parse::<usize>().ok());
                places >= minimum && maximum.map_or(true, |max| places <= max)
            }
        }
        "digits" => {
            let count = args[0].trim().parse::<usize>().unwrap_or(0);
            text.len() == count && text.chars().all(|c| c.is_ascii_digit())
        }
        "min" | "max" | "size" | "between" => {
            let size = size_of(value, numeric);
            let bound = |index: usize| args[index].trim().parse::<f64>().unwrap_or(f64::NAN);
            let pass = match name {
                "min" => size >= bound(0),
                "max" => size <= bound(0),
                "size" => size == bound(0),
                _ => size >= bound(0) && size <= bound(1),
            };
            if pass {
                return None;
            }
            return Some(size_message(name, value, numeric, field, args));
        }
        "gt" | "gte" | "lt" | "lte" => {
            let other = if is_number(args[0]) {
                args[0].trim().parse::<f64>().ok()
            } else {
                get_path(body, args[0]).and_then(number_of)
            };
            let pass = match (number_of(value), other) {
                (Some(current), Some(other)) => match name {
                    "gt" => current > other,
                    "gte" => current >= other,
                    "lt" => current < other,
                    _ => current <= other,
                },
                _ => false,
            };
            if pass {
                return None;
            }
            let relation = match name {
                "gt" => "greater than",
                "gte" => "greater than or equal to",
                "lt" => "less than",
                _ => "less than or equal to",
            };
            return Some(format!(
                "The {} field must be {relation} {}.",
                attribute(field),
                args[0]
            ));
        }
        "in" => args.iter().any(|option| *option == text),
        "not_in" => !args.iter().any(|option| *option == text),
        "regex" => compile_pattern(rule.raw).is_some_and(|pattern| pattern.is_match(&text)),
        "not_regex" => compile_pattern(rule.raw).is_some_and(|pattern| !pattern.is_match(&text)),
        "confirmed" => get_path(body, &format!("{field}_confirmation")) == Some(value),
        "same" => get_path(body, args[0]) == Some(value),
        "different" => get_path(body, args[0]) != Some(value),
        "distinct" => distinct(field, value, rule, body),
        // Evaluated by api.rs (needs the database) or by the upload handler (needs a file).
        "unique" | "exists" | "file" | "image" | "mimes" | "mimetypes" => true,
        _ => {
            return Some(format!(
                "Validation rule \"{name}\" is not supported by the Rust engine."
            ))
        }
    };
    if ok {
        return None;
    }
    let message = fail_message(name, field);
    Some(match name {
        "same" => format!("The {} field and {} must match.", attribute(field), args[0]),
        "different" => format!(
            "The {} field and {} must be different.",
            attribute(field),
            args[0]
        ),
        "digits" => format!("The {} field must be {} digits.", attribute(field), args[0]),
        "starts_with" | "ends_with" | "doesnt_start_with" | "doesnt_end_with" => {
            let phrase = match name {
                "starts_with" => "must start with one of the following",
                "ends_with" => "must end with one of the following",
                "doesnt_start_with" => "must not start with one of the following",
                _ => "must not end with one of the following",
            };
            format!("The {} field {phrase}: {}.", attribute(field), args.join(", "))
        }
        _ => message,
    })
}

fn distinct(field: &str, value: &Value, rule: &Rule<'_>, body: &Map<String, Value>) -> bool {
    let parts: Vec<&str> = field.split('.').collect();
    let Some(index) = parts
        .iter()
        .rposition(|part| !part.is_empty() && part.chars().all(|c| c.is_ascii_digit()))
    else {
        return true;
    };
    let Some(Value::Array(siblings)) = get_path(body, &parts[..index].join(".")) else {
        return true;
    };
    let rest = parts[index + 1..].join(".");
    let ignore_case = rule.args.first() == Some(&"ignore_case");
    let canonical = |candidate: &Value| match candidate {
        Value::String(text) if ignore_case => Value::String(text.to_lowercase()),
        other => other.clone(),
    };
    let current = canonical(value);
    let matching = siblings
        .iter()
        .filter(|item| {
            let candidate = if rest.is_empty() {
                Some(*item)
            } else {
                let mut cursor = Some(*item);
                for segment in rest.split('.') {
                    cursor = cursor.and_then(|node| node.get(segment));
                }
                cursor
            };
            candidate.is_some_and(|candidate| canonical(candidate) == current)
        })
        .count();
    matching <= 1
}

#[cfg(test)]
mod tests {
    use super::*;
    use serde_json::json;

    fn body(value: Value) -> Map<String, Value> {
        value.as_object().unwrap().clone()
    }

    fn run(rule: &str, value: Value, data: Value) -> Vec<String> {
        let data = body(data);
        validate_field("field", Some(&value), rule, &data)
    }

    #[test]
    fn conformance_vectors() {
        let raw = include_str!("../tests/validation-vectors.json");
        let cases: Vec<Value> = serde_json::from_str(raw).unwrap();
        let mut failures = Vec::new();
        for case in cases {
            let rule = case["rule"].as_str().unwrap();
            let data = body(case.get("data").cloned().unwrap_or(json!({})));
            let value = case.get("value");
            let errors = validate_field("field", value, rule, &data);
            let expect_pass = case["pass"].as_bool().unwrap();
            if errors.is_empty() != expect_pass {
                failures.push(format!("{} value={:?} expected pass={}", rule, value, expect_pass));
            }
        }
        assert!(failures.is_empty(), "vector failures:\n{}", failures.join("\n"));
    }

    #[test]
    fn unsupported_rules_are_rejected_up_front() {
        for rule in ["date_format:Y-m-d", "after:2020-01-01", "digits_between:1,3", "bogus"] {
            assert!(!rule_set_supported(rule), "{rule} should be unsupported");
        }
        assert!(rule_set_supported("required|string|max:255|regex:/^a+$/i"));
        assert!(!rule_set_supported("regex:/(?=a)a/"));
    }

    #[test]
    fn wildcard_keys_expand() {
        let data = body(json!({"items": [{"n": "a"}, {"n": "b"}]}));
        let rules = body(json!({"items.*.n": "required|string"}));
        let keys: Vec<String> = expand_keys(&rules, &data).into_iter().map(|(k, _)| k).collect();
        assert_eq!(keys, vec!["items.0.n", "items.1.n"]);
    }

    #[test]
    fn messages_match_express() {
        assert_eq!(
            run("min:3", json!("ab"), json!({})),
            vec!["The field field must be at least 3 characters."]
        );
    }
}
