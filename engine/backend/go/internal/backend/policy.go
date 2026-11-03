package backend

import (
	"encoding/base64"
	"fmt"
	"go/ast"
	"go/parser"
	"go/token"
	"strconv"
	"strings"
)

func validGoPolicySnippet(encoded string) bool {
	expression, err := goPolicyExpression(encoded)
	if err != nil {
		return false
	}
	return safePolicyExpression(expression)
}

func evaluateGoPolicy(encoded string, item map[string]any) (bool, error) {
	expression, err := goPolicyExpression(encoded)
	if err != nil {
		return false, err
	}
	value, err := evalPolicyExpression(expression, item)
	if err != nil {
		return false, err
	}
	allowed, ok := value.(bool)
	if !ok {
		return false, fmt.Errorf("policy expression did not return a boolean")
	}
	return allowed, nil
}

func goPolicyExpression(encoded string) (ast.Expr, error) {
	body, err := base64.StdEncoding.DecodeString(encoded)
	if err != nil {
		return nil, fmt.Errorf("decode policy body: %w", err)
	}
	file, err := parser.ParseFile(token.NewFileSet(), "policy.go",
		"package policy\nfunc authorize() bool {\n"+string(body)+"\n}", 0)
	if err != nil {
		return nil, fmt.Errorf("parse policy body: %w", err)
	}
	if len(file.Decls) != 1 {
		return nil, fmt.Errorf("policy must contain one function")
	}
	function, ok := file.Decls[0].(*ast.FuncDecl)
	if !ok || len(function.Body.List) != 1 {
		return nil, fmt.Errorf("policy must contain one return statement")
	}
	statement, ok := function.Body.List[0].(*ast.ReturnStmt)
	if !ok || len(statement.Results) != 1 {
		return nil, fmt.Errorf("policy must return one value")
	}
	return statement.Results[0], nil
}

func safePolicyExpression(expression ast.Expr) bool {
	switch node := expression.(type) {
	case *ast.Ident:
		return node.Name == "item" || node.Name == "nil" || node.Name == "true" || node.Name == "false"
	case *ast.BasicLit:
		return node.Kind == token.STRING || node.Kind == token.INT || node.Kind == token.FLOAT
	case *ast.SelectorExpr:
		identifier, ok := node.X.(*ast.Ident)
		return ok && identifier.Name == "item" && node.Sel.IsExported()
	case *ast.ParenExpr:
		return safePolicyExpression(node.X)
	case *ast.UnaryExpr:
		return node.Op == token.NOT && safePolicyExpression(node.X)
	case *ast.BinaryExpr:
		switch node.Op {
		case token.LAND, token.LOR, token.EQL, token.NEQ, token.LSS, token.LEQ, token.GTR, token.GEQ:
			return safePolicyExpression(node.X) && safePolicyExpression(node.Y)
		}
	}
	return false
}

func evalPolicyExpression(expression ast.Expr, item map[string]any) (any, error) {
	switch node := expression.(type) {
	case *ast.Ident:
		switch node.Name {
		case "item":
			return item, nil
		case "nil":
			return nil, nil
		case "true":
			return true, nil
		case "false":
			return false, nil
		}
	case *ast.BasicLit:
		switch node.Kind {
		case token.STRING:
			return strconv.Unquote(node.Value)
		case token.INT:
			return strconv.ParseInt(node.Value, 0, 64)
		case token.FLOAT:
			return strconv.ParseFloat(node.Value, 64)
		}
	case *ast.SelectorExpr:
		if node.Sel.IsExported() {
			key := policyColumnName(node.Sel.Name)
			return item[key], nil
		}
	case *ast.ParenExpr:
		return evalPolicyExpression(node.X, item)
	case *ast.UnaryExpr:
		value, err := evalPolicyExpression(node.X, item)
		if err != nil {
			return nil, err
		}
		if node.Op == token.NOT {
			boolean, ok := value.(bool)
			if !ok {
				return nil, fmt.Errorf("policy negation requires a boolean")
			}
			return !boolean, nil
		}
	case *ast.BinaryExpr:
		left, err := evalPolicyExpression(node.X, item)
		if err != nil {
			return nil, err
		}
		if node.Op == token.LAND || node.Op == token.LOR {
			boolean, ok := left.(bool)
			if !ok {
				return nil, fmt.Errorf("policy logic requires booleans")
			}
			if node.Op == token.LAND && !boolean {
				return false, nil
			}
			if node.Op == token.LOR && boolean {
				return true, nil
			}
			right, err := evalPolicyExpression(node.Y, item)
			if err != nil {
				return nil, err
			}
			rightBoolean, ok := right.(bool)
			if !ok {
				return nil, fmt.Errorf("policy logic requires booleans")
			}
			return rightBoolean, nil
		}
		right, err := evalPolicyExpression(node.Y, item)
		if err != nil {
			return nil, err
		}
		return comparePolicyValues(node.Op, left, right)
	}
	return nil, fmt.Errorf("unsupported policy expression")
}

func policyColumnName(field string) string {
	var name strings.Builder
	for index, char := range field {
		if char >= 'A' && char <= 'Z' {
			if index > 0 {
				name.WriteByte('_')
			}
			name.WriteByte(byte(char + ('a' - 'A')))
			continue
		}
		name.WriteRune(char)
	}
	return name.String()
}

func comparePolicyValues(operation token.Token, left, right any) (bool, error) {
	if operation == token.EQL || operation == token.NEQ {
		equal := fmt.Sprint(left) == fmt.Sprint(right)
		if left == nil || right == nil {
			equal = left == nil && right == nil
		}
		if operation == token.NEQ {
			equal = !equal
		}
		return equal, nil
	}
	leftNumber, leftOK := policyNumber(left)
	rightNumber, rightOK := policyNumber(right)
	if leftOK && rightOK {
		switch operation {
		case token.LSS:
			return leftNumber < rightNumber, nil
		case token.LEQ:
			return leftNumber <= rightNumber, nil
		case token.GTR:
			return leftNumber > rightNumber, nil
		case token.GEQ:
			return leftNumber >= rightNumber, nil
		}
	}
	leftString, leftStringOK := left.(string)
	rightString, rightStringOK := right.(string)
	if leftStringOK && rightStringOK {
		switch operation {
		case token.LSS:
			return leftString < rightString, nil
		case token.LEQ:
			return leftString <= rightString, nil
		case token.GTR:
			return leftString > rightString, nil
		case token.GEQ:
			return leftString >= rightString, nil
		}
	}
	return false, fmt.Errorf("incompatible policy comparison")
}

func policyNumber(value any) (float64, bool) {
	switch number := value.(type) {
	case int:
		return float64(number), true
	case int64:
		return float64(number), true
	case float64:
		return number, true
	default:
		return 0, false
	}
}
