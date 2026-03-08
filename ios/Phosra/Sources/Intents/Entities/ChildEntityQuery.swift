import AppIntents

struct ChildEntityQuery: EntityStringQuery {

    // MARK: - Resolve by IDs

    func entities(for identifiers: [String]) async throws -> [ChildEntity] {
        guard (try? await AuthManager.shared.getValidJWT()) != nil else {
            return []
        }

        let allChildren = await fetchAllChildren()
        return allChildren.filter { identifiers.contains($0.id) }
    }

    // MARK: - Fuzzy string match

    func entities(matching string: String) async throws -> [ChildEntity] {
        let allChildren = await fetchAllChildren()
        guard !string.isEmpty else { return allChildren }

        return allChildren.filter {
            $0.name.localizedCaseInsensitiveContains(string)
        }
    }

    // MARK: - Suggested (all children)

    func suggestedEntities() async throws -> [ChildEntity] {
        await fetchAllChildren()
    }

    // MARK: - Private Helpers

    /// Fetches every child across all of the user's families and maps them
    /// to `ChildEntity` values. Returns an empty array if the user is not
    /// authenticated or if any network call fails.
    private func fetchAllChildren() async -> [ChildEntity] {
        do {
            let families = try await PhosraAPIClient.shared.listFamilies()
            var entities: [ChildEntity] = []

            for family in families {
                let children = try await PhosraAPIClient.shared.listChildren(familyId: family.id)

                for child in children {
                    // Look up active policy (status == "active"), if any
                    let policies = try? await PhosraAPIClient.shared.listPolicies(childId: child.id)
                    let activePolicyId = policies?.first(where: { $0.status == "active" })?.id

                    entities.append(
                        ChildEntity(
                            id: child.id,
                            name: child.name,
                            age: child.calculatedAge,
                            familyId: child.familyId,
                            activePolicyId: activePolicyId
                        )
                    )
                }
            }

            return entities
        } catch {
            return []
        }
    }
}
