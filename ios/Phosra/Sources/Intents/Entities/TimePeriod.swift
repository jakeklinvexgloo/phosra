import AppIntents

enum TimePeriod: String, AppEnum {
    case today
    case thisWeek
    case thisMonth

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Time Period")
    static let caseDisplayRepresentations: [Self: DisplayRepresentation] = [
        .today: DisplayRepresentation(title: "Today"),
        .thisWeek: DisplayRepresentation(title: "This Week"),
        .thisMonth: DisplayRepresentation(title: "This Month"),
    ]
}
