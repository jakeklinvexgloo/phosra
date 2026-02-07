package provider

import "sync"

// Registry manages all registered provider adapters.
type Registry struct {
	mu       sync.RWMutex
	adapters map[string]Adapter
}

func NewRegistry() *Registry {
	return &Registry{
		adapters: make(map[string]Adapter),
	}
}

func (r *Registry) Register(adapter Adapter) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.adapters[adapter.Info().ID] = adapter
}

func (r *Registry) Get(id string) (Adapter, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	a, ok := r.adapters[id]
	return a, ok
}

func (r *Registry) GetOAuth(id string) (OAuthAdapter, bool) {
	r.mu.RLock()
	defer r.mu.RUnlock()
	a, ok := r.adapters[id]
	if !ok {
		return nil, false
	}
	oauth, ok := a.(OAuthAdapter)
	return oauth, ok
}

func (r *Registry) List() []Adapter {
	r.mu.RLock()
	defer r.mu.RUnlock()
	result := make([]Adapter, 0, len(r.adapters))
	for _, a := range r.adapters {
		result = append(result, a)
	}
	return result
}

func (r *Registry) ListByCapability(cap Capability) []Adapter {
	r.mu.RLock()
	defer r.mu.RUnlock()
	var result []Adapter
	for _, a := range r.adapters {
		for _, c := range a.Capabilities() {
			if c == cap {
				result = append(result, a)
				break
			}
		}
	}
	return result
}
