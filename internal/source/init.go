package source

// RegisterAll registers all built-in source adapters in the given registry.
// This is a convenience entry point — call it from cmd/server or cmd/worker
// after importing the setup package:
//
//	import "github.com/guardiangate/api/internal/source/setup"
//	setup.RegisterAll(sourceRegistry)
//
// This file does NOT import sub-packages to avoid circular dependencies.
// The actual wiring lives in internal/source/setup/setup.go.
