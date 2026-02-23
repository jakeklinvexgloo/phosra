package source

import "sync"

// Registry manages all registered source adapters.
type Registry struct {
	mu       sync.RWMutex
	adapters map[string]SourceAdapter
}

// NewRegistry creates an empty source adapter registry.
func NewRegistry() *Registry {
	return &Registry{
		adapters: make(map[string]SourceAdapter),
	}
}

// Register adds a source adapter to the registry, keyed by its slug.
func (r *Registry) Register(adapter SourceAdapter) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.adapters[adapter.Info().Slug] = adapter
}

// Get retrieves a source adapter by slug.
func (r *Registry) Get(slug string) (SourceAdapter, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	a, ok := r.adapters[slug]
	return a, ok
}

// List returns metadata for all registered sources.
func (r *Registry) List() []SourceInfo {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make([]SourceInfo, 0, len(r.adapters))
	for _, a := range r.adapters {
		result = append(result, a.Info())
	}
	return result
}

// GetCapabilities returns capabilities for a specific source by slug.
func (r *Registry) GetCapabilities(slug string) ([]SourceCapability, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	a, ok := r.adapters[slug]
	if !ok {
		return nil, false
	}
	return a.Capabilities(), true
}

// ListByTier returns all sources matching the given API tier ("managed" or "guided").
func (r *Registry) ListByTier(tier string) []SourceAdapter {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []SourceAdapter
	for _, a := range r.adapters {
		if a.Info().APITier == tier {
			result = append(result, a)
		}
	}
	return result
}
