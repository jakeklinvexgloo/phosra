package validation

import (
	"fmt"
	"net/mail"
	"strings"
	"time"
	"unicode/utf8"
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationErrors []ValidationError

func (ve ValidationErrors) Error() string {
	msgs := make([]string, len(ve))
	for i, e := range ve {
		msgs[i] = fmt.Sprintf("%s: %s", e.Field, e.Message)
	}
	return strings.Join(msgs, "; ")
}

func (ve ValidationErrors) HasErrors() bool {
	return len(ve) > 0
}

func ValidateEmail(email string) error {
	if email == "" {
		return fmt.Errorf("email is required")
	}
	if _, err := mail.ParseAddress(email); err != nil {
		return fmt.Errorf("invalid email format")
	}
	return nil
}

func ValidatePassword(password string) error {
	if utf8.RuneCountInString(password) < 8 {
		return fmt.Errorf("password must be at least 8 characters")
	}
	return nil
}

func ValidateName(name string) error {
	if strings.TrimSpace(name) == "" {
		return fmt.Errorf("name is required")
	}
	if utf8.RuneCountInString(name) > 255 {
		return fmt.Errorf("name must be 255 characters or less")
	}
	return nil
}

func ValidateBirthDate(date time.Time) error {
	if date.IsZero() {
		return fmt.Errorf("birth date is required")
	}
	if date.After(time.Now()) {
		return fmt.Errorf("birth date cannot be in the future")
	}
	if date.Before(time.Now().AddDate(-25, 0, 0)) {
		return fmt.Errorf("birth date seems too far in the past for a child")
	}
	return nil
}
