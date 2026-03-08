import Foundation

/// A type-erased `Codable` wrapper for arbitrary JSON values.
///
/// Used for dynamic config fields in API responses where the shape
/// of the JSON is not known at compile time (e.g. `PolicyRule.config`).
struct AnyCodable: Codable, Sendable {

    let value: AnyCodableValue

    init(_ value: Any?) {
        self.value = AnyCodableValue(value)
    }

    init(from decoder: Decoder) throws {
        let container = try decoder.singleValueContainer()

        if container.decodeNil() {
            self.value = .null
        } else if let bool = try? container.decode(Bool.self) {
            self.value = .bool(bool)
        } else if let int = try? container.decode(Int.self) {
            self.value = .int(int)
        } else if let double = try? container.decode(Double.self) {
            self.value = .double(double)
        } else if let string = try? container.decode(String.self) {
            self.value = .string(string)
        } else if let array = try? container.decode([AnyCodable].self) {
            self.value = .array(array.map(\.value))
        } else if let dict = try? container.decode([String: AnyCodable].self) {
            self.value = .object(dict.mapValues(\.value))
        } else {
            throw DecodingError.dataCorruptedError(
                in: container,
                debugDescription: "AnyCodable could not decode value"
            )
        }
    }

    func encode(to encoder: Encoder) throws {
        var container = encoder.singleValueContainer()
        try value.encode(to: &container)
    }
}

// MARK: - AnyCodableValue

/// Sendable enum representing all possible JSON value types.
enum AnyCodableValue: Sendable {
    case null
    case bool(Bool)
    case int(Int)
    case double(Double)
    case string(String)
    case array([AnyCodableValue])
    case object([String: AnyCodableValue])

    init(_ value: Any?) {
        guard let value else {
            self = .null
            return
        }
        switch value {
        case let b as Bool:
            self = .bool(b)
        case let i as Int:
            self = .int(i)
        case let d as Double:
            self = .double(d)
        case let s as String:
            self = .string(s)
        case let arr as [Any?]:
            self = .array(arr.map { AnyCodableValue($0) })
        case let dict as [String: Any?]:
            self = .object(dict.mapValues { AnyCodableValue($0) })
        default:
            self = .string(String(describing: value))
        }
    }

    func encode(to container: inout SingleValueEncodingContainer) throws {
        switch self {
        case .null:
            try container.encodeNil()
        case .bool(let b):
            try container.encode(b)
        case .int(let i):
            try container.encode(i)
        case .double(let d):
            try container.encode(d)
        case .string(let s):
            try container.encode(s)
        case .array(let arr):
            try container.encode(arr.map { AnyCodable(wrapping: $0) })
        case .object(let dict):
            try container.encode(dict.mapValues { AnyCodable(wrapping: $0) })
        }
    }
}

// MARK: - Internal Initializer

private extension AnyCodable {
    init(wrapping value: AnyCodableValue) {
        self.value = value
    }
}

// MARK: - Convenience Accessors

extension AnyCodable {

    /// Access the underlying value as a dictionary, if it is one.
    var dictionary: [String: AnyCodable]? {
        guard case .object(let dict) = value else { return nil }
        return dict.mapValues { AnyCodable(wrapping: $0) }
    }

    /// Access the underlying value as an array, if it is one.
    var array: [AnyCodable]? {
        guard case .array(let arr) = value else { return nil }
        return arr.map { AnyCodable(wrapping: $0) }
    }

    /// Access the underlying value as a string, if it is one.
    var stringValue: String? {
        guard case .string(let s) = value else { return nil }
        return s
    }

    /// Access the underlying value as an int, if it is one.
    var intValue: Int? {
        guard case .int(let i) = value else { return nil }
        return i
    }

    /// Access the underlying value as a bool, if it is one.
    var boolValue: Bool? {
        guard case .bool(let b) = value else { return nil }
        return b
    }

    /// Access the underlying value as a double, if it is one.
    var doubleValue: Double? {
        switch value {
        case .double(let d): return d
        case .int(let i): return Double(i)
        default: return nil
        }
    }

    /// Returns true if the value is null.
    var isNull: Bool {
        guard case .null = value else { return false }
        return true
    }
}

// MARK: - Equatable

extension AnyCodableValue: Equatable {}
extension AnyCodable: Equatable {
    static func == (lhs: AnyCodable, rhs: AnyCodable) -> Bool {
        lhs.value == rhs.value
    }
}
