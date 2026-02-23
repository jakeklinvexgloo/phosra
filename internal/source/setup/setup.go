package setup

import (
	"github.com/guardiangate/api/internal/source"
	"github.com/guardiangate/api/internal/source/bark"
	"github.com/guardiangate/api/internal/source/qustodio"
	"github.com/guardiangate/api/internal/source/stubs"
)

// RegisterAll registers all source adapters in the given registry.
// Import this package from cmd/server or cmd/worker to wire up sources:
//
//	sourceRegistry := source.NewRegistry()
//	setup.RegisterAll(sourceRegistry)
func RegisterAll(registry *source.Registry) {
	// Managed adapters — sources with API integrations
	registry.Register(qustodio.NewAdapter())
	registry.Register(bark.NewAdapter())

	// Guided/stub adapters — sources without API integrations
	registry.Register(stubs.NewStubAdapter("net-nanny", "Net Nanny", "https://www.netnanny.com", "Content filtering and screen time management"))
	registry.Register(stubs.NewStubAdapter("kidslox", "Kidslox", "https://kidslox.com", "Screen time and app blocking"))
	registry.Register(stubs.NewStubAdapter("ourpact", "OurPact", "https://ourpact.com", "Screen time and app management"))
	registry.Register(stubs.NewStubAdapter("mmguardian", "MMGuardian", "https://www.mmguardian.com", "Phone monitoring and web filtering"))
	registry.Register(stubs.NewStubAdapter("mobicip", "Mobicip", "https://www.mobicip.com", "Content filtering and screen time"))
	registry.Register(stubs.NewStubAdapter("circle", "Circle", "https://meetcircle.com", "Network-level parental controls"))
	registry.Register(stubs.NewStubAdapter("kaspersky-safe-kids", "Kaspersky Safe Kids", "https://www.kaspersky.com/safe-kids", "Multi-platform parental controls"))
	registry.Register(stubs.NewStubAdapter("norton-family", "Norton Family", "https://family.norton.com", "Web supervision and screen time"))
}
