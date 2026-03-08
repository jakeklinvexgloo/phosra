import AppIntents

enum StrictnessLevel: String, AppEnum {
    case relaxed
    case recommended
    case strict

    static let typeDisplayRepresentation = TypeDisplayRepresentation(name: "Protection Level")
    static let caseDisplayRepresentations: [Self: DisplayRepresentation] = [
        .relaxed: DisplayRepresentation(title: "Relaxed", subtitle: "Lighter touch, more freedom"),
        .recommended: DisplayRepresentation(title: "Recommended", subtitle: "Age-appropriate defaults"),
        .strict: DisplayRepresentation(title: "Strict", subtitle: "Tighter limits, more blocking"),
    ]
}
