package google

import "sync"

// GoogleClientManager is a thread-safe lazy map that creates *Client per account key.
type GoogleClientManager struct {
	mu           sync.RWMutex
	clients      map[string]*Client
	clientID     string
	clientSecret string
	redirectURI  string
	encryptKey   string
	tokenStore   TokenStore
}

func NewGoogleClientManager(clientID, clientSecret, redirectURI, encryptKey string, store TokenStore) *GoogleClientManager {
	return &GoogleClientManager{
		clients:      make(map[string]*Client),
		clientID:     clientID,
		clientSecret: clientSecret,
		redirectURI:  redirectURI,
		encryptKey:   encryptKey,
		tokenStore:   store,
	}
}

func (m *GoogleClientManager) GetClient(accountKey string) *Client {
	m.mu.RLock()
	c, ok := m.clients[accountKey]
	m.mu.RUnlock()
	if ok {
		return c
	}

	m.mu.Lock()
	defer m.mu.Unlock()
	// Double-check
	if c, ok := m.clients[accountKey]; ok {
		return c
	}
	c = NewClient(m.clientID, m.clientSecret, m.redirectURI, m.encryptKey, accountKey, m.tokenStore)
	m.clients[accountKey] = c
	return c
}

func (m *GoogleClientManager) IsConfigured() bool {
	return m.clientID != ""
}
