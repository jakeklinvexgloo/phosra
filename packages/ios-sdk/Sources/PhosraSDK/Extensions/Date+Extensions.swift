import Foundation

extension Date {
    /// Formats the date as an ISO 8601 string (e.g., "2025-01-15T10:30:00Z").
    var iso8601String: String {
        return Date.iso8601Formatter.string(from: self)
    }

    /// Formats the date as a calendar date string (e.g., "2025-01-15").
    var dateString: String {
        return Date.dateOnlyFormatter.string(from: self)
    }

    /// Formats the date as a time-only string (e.g., "10:30").
    var timeString: String {
        return Date.timeOnlyFormatter.string(from: self)
    }

    /// Parses an ISO 8601 date string.
    ///
    /// - Parameter string: An ISO 8601 formatted date string.
    /// - Returns: A `Date` if parsing succeeds, or `nil`.
    static func fromISO8601(_ string: String) -> Date? {
        return iso8601Formatter.date(from: string)
    }

    /// Parses a time string in "HH:mm" format into `DateComponents`.
    ///
    /// - Parameter timeString: A time string like "21:30".
    /// - Returns: `DateComponents` with hour and minute set, or `nil` if parsing fails.
    static func dateComponents(from timeString: String) -> DateComponents? {
        let parts = timeString.split(separator: ":")
        guard parts.count == 2,
              let hour = Int(parts[0]),
              let minute = Int(parts[1]),
              (0...23).contains(hour),
              (0...59).contains(minute) else {
            return nil
        }
        return DateComponents(hour: hour, minute: minute)
    }

    // MARK: - Shared Formatters

    private static let iso8601Formatter: ISO8601DateFormatter = {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withInternetDateTime, .withFractionalSeconds]
        return formatter
    }()

    private static let dateOnlyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "yyyy-MM-dd"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        formatter.timeZone = TimeZone(identifier: "UTC")
        return formatter
    }()

    private static let timeOnlyFormatter: DateFormatter = {
        let formatter = DateFormatter()
        formatter.dateFormat = "HH:mm"
        formatter.locale = Locale(identifier: "en_US_POSIX")
        return formatter
    }()
}
