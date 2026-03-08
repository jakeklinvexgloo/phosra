import AppIntents

struct FamilyEntity: AppEntity {
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Family")
    static let defaultQuery = FamilyEntityQuery()

    var id: String
    var name: String

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)")
    }
}

// MARK: - Family Entity Query

struct FamilyEntityQuery: EntityStringQuery {

    func entities(for identifiers: [String]) async throws -> [FamilyEntity] {
        let all = await fetchAllFamilies()
        return all.filter { identifiers.contains($0.id) }
    }

    func entities(matching string: String) async throws -> [FamilyEntity] {
        let all = await fetchAllFamilies()
        guard !string.isEmpty else { return all }

        return all.filter {
            $0.name.localizedCaseInsensitiveContains(string)
        }
    }

    func suggestedEntities() async throws -> [FamilyEntity] {
        await fetchAllFamilies()
    }

    // MARK: - Private

    private func fetchAllFamilies() async -> [FamilyEntity] {
        do {
            let families = try await PhosraAPIClient.shared.listFamilies()
            return families.map {
                FamilyEntity(id: $0.id, name: $0.name)
            }
        } catch {
            return []
        }
    }
}
