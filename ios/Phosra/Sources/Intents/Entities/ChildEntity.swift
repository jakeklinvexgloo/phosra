import AppIntents

struct ChildEntity: AppEntity {
    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Child")
    static let defaultQuery = ChildEntityQuery()

    var id: String
    var name: String
    var age: Int
    var familyId: String
    var activePolicyId: String?

    var displayRepresentation: DisplayRepresentation {
        DisplayRepresentation(title: "\(name)", subtitle: "Age \(age)")
    }
}
