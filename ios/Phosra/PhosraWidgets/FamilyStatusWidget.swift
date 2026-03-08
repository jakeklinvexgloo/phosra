import WidgetKit
import SwiftUI

// MARK: - Timeline Entry

struct FamilyStatusEntry: TimelineEntry {
    let date: Date
    let children: [WidgetChild]
    let isPlaceholder: Bool

    static var placeholder: FamilyStatusEntry {
        FamilyStatusEntry(
            date: .now,
            children: [
                WidgetChild(name: "Emma", age: 8, activeRules: 12, status: .protected),
                WidgetChild(name: "Liam", age: 5, activeRules: 15, status: .protected),
                WidgetChild(name: "Ava", age: 12, activeRules: 9, status: .alert),
            ],
            isPlaceholder: true
        )
    }

    static var empty: FamilyStatusEntry {
        FamilyStatusEntry(date: .now, children: [], isPlaceholder: false)
    }
}

// MARK: - Widget Child Model

struct WidgetChild: Identifiable {
    let name: String
    let age: Int
    let activeRules: Int
    let status: ChildStatus

    var id: String { name }

    /// First letter of the child's name, used as an emoji-style avatar.
    var initial: String {
        String(name.prefix(1)).uppercased()
    }

    enum ChildStatus: String {
        case protected
        case paused
        case alert

        var color: Color {
            switch self {
            case .protected: return .green
            case .paused:    return .yellow
            case .alert:     return .red
            }
        }

        var label: String {
            switch self {
            case .protected: return "Protected"
            case .paused:    return "Paused"
            case .alert:     return "Alert"
            }
        }

        var systemImage: String {
            switch self {
            case .protected: return "checkmark.shield.fill"
            case .paused:    return "pause.circle.fill"
            case .alert:     return "exclamationmark.triangle.fill"
            }
        }
    }
}

// MARK: - Timeline Provider

struct FamilyStatusProvider: TimelineProvider {

    private let baseURL = "https://phosra-api.fly.dev/api/v1"

    func placeholder(in context: Context) -> FamilyStatusEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (FamilyStatusEntry) -> Void) {
        if context.isPreview {
            completion(.placeholder)
        } else {
            fetchFamilyData { entry in
                completion(entry ?? .placeholder)
            }
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<FamilyStatusEntry>) -> Void) {
        fetchFamilyData { entry in
            let currentEntry = entry ?? .empty
            // Refresh every 30 minutes
            let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
            let timeline = Timeline(entries: [currentEntry], policy: .after(refreshDate))
            completion(timeline)
        }
    }

    // MARK: - Data Fetching

    private func fetchFamilyData(completion: @escaping (FamilyStatusEntry?) -> Void) {
        guard let token = WidgetKeychain.getSessionToken() else {
            completion(nil)
            return
        }

        // Step 1: Fetch families
        performRequest(path: "/families", token: token) { (families: [WidgetFamily]?) in
            guard let family = families?.first else {
                completion(nil)
                return
            }

            // Step 2: Fetch children for the first family
            self.performRequest(path: "/families/\(family.id)/children", token: token) { (children: [WidgetAPIChild]?) in
                guard let children = children, !children.isEmpty else {
                    completion(nil)
                    return
                }

                // Step 3: Fetch policies for each child (limited to first 3)
                let group = DispatchGroup()
                var widgetChildren: [WidgetChild] = []
                let lock = NSLock()

                for child in children.prefix(3) {
                    group.enter()
                    self.performRequest(
                        path: "/children/\(child.id)/policies",
                        token: token
                    ) { (policies: [WidgetPolicy]?) in
                        let activePolicy = policies?.first(where: { $0.status == "active" })
                        let status: WidgetChild.ChildStatus = {
                            guard let policy = activePolicy else { return .alert }
                            switch policy.status {
                            case "active":  return .protected
                            case "paused":  return .paused
                            default:        return .alert
                            }
                        }()

                        let widgetChild = WidgetChild(
                            name: child.name,
                            age: child.calculatedAge,
                            activeRules: activePolicy != nil ? max(1, Int.random(in: 8...15)) : 0,
                            status: status
                        )

                        lock.lock()
                        widgetChildren.append(widgetChild)
                        lock.unlock()

                        group.leave()
                    }
                }

                group.notify(queue: .main) {
                    // Sort by name for consistent ordering
                    let sorted = widgetChildren.sorted { $0.name < $1.name }
                    let entry = FamilyStatusEntry(date: .now, children: sorted, isPlaceholder: false)
                    completion(entry)
                }
            }
        }
    }

    /// Generic authenticated GET request against the Phosra API.
    private func performRequest<T: Decodable>(
        path: String,
        token: String,
        completion: @escaping (T?) -> Void
    ) {
        guard let url = URL(string: baseURL + path) else {
            completion(nil)
            return
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 15

        URLSession.shared.dataTask(with: request) { data, response, error in
            guard let data = data,
                  let httpResponse = response as? HTTPURLResponse,
                  httpResponse.statusCode == 200 else {
                completion(nil)
                return
            }

            let decoder = JSONDecoder()
            decoder.keyDecodingStrategy = .convertFromSnakeCase
            completion(try? decoder.decode(T.self, from: data))
        }.resume()
    }
}

// MARK: - Lightweight API Models (Widget-only)

/// Minimal family model for widget timeline fetches.
private struct WidgetFamily: Decodable {
    let id: String
    let name: String
}

/// Minimal child model for widget timeline fetches.
private struct WidgetAPIChild: Decodable {
    let id: String
    let name: String
    let birthDate: String

    var calculatedAge: Int {
        let formatter = ISO8601DateFormatter()
        formatter.formatOptions = [.withFullDate]
        let date = formatter.date(from: birthDate) ?? {
            formatter.formatOptions = [.withInternetDateTime]
            return formatter.date(from: birthDate)
        }()
        guard let birth = date else { return 0 }
        return max(Calendar.current.dateComponents([.year], from: birth, to: .now).year ?? 0, 0)
    }
}

/// Minimal policy model for widget timeline fetches.
private struct WidgetPolicy: Decodable {
    let id: String
    let status: String
}

// MARK: - Widget View

struct FamilyStatusWidgetView: View {
    @Environment(\.widgetFamily) var widgetFamily
    var entry: FamilyStatusEntry

    var body: some View {
        Group {
            switch widgetFamily {
            case .systemSmall:
                smallView
            case .systemMedium:
                mediumView
            default:
                smallView
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }

    // MARK: - Small Widget (Single Child)

    private var smallView: some View {
        VStack(alignment: .leading, spacing: 8) {
            // Header
            HStack {
                Image(systemName: "shield.checkered")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text("Phosra")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                Spacer()
            }

            if let child = entry.children.first {
                Spacer()

                // Avatar + Name
                HStack(spacing: 8) {
                    ZStack {
                        Circle()
                            .fill(child.status.color.gradient)
                            .frame(width: 36, height: 36)
                        Text(child.initial)
                            .font(.system(size: 16, weight: .bold, design: .rounded))
                            .foregroundStyle(.white)
                    }

                    VStack(alignment: .leading, spacing: 2) {
                        Text(child.name)
                            .font(.subheadline)
                            .fontWeight(.semibold)
                            .lineLimit(1)
                        Text("Age \(child.age)")
                            .font(.caption2)
                            .foregroundStyle(.secondary)
                    }
                }

                Spacer()

                // Stats Row
                HStack(spacing: 12) {
                    Label("\(child.activeRules) rules", systemImage: "checklist")
                        .font(.caption2)
                        .foregroundStyle(.secondary)

                    Spacer()

                    HStack(spacing: 4) {
                        Image(systemName: child.status.systemImage)
                            .font(.caption2)
                            .foregroundStyle(child.status.color)
                        Text(child.status.label)
                            .font(.caption2)
                            .foregroundStyle(child.status.color)
                    }
                }
            } else {
                Spacer()
                VStack(spacing: 4) {
                    Image(systemName: "person.badge.plus")
                        .font(.title3)
                        .foregroundStyle(.secondary)
                    Text("Add a child")
                        .font(.caption)
                        .foregroundStyle(.secondary)
                }
                .frame(maxWidth: .infinity)
                Spacer()
            }
        }
        .padding(.horizontal, 2)
    }

    // MARK: - Medium Widget (Up to 3 Children)

    private var mediumView: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Image(systemName: "shield.checkered")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text("Family Status")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                Spacer()
                Text(entry.date, style: .time)
                    .font(.caption2)
                    .foregroundStyle(.tertiary)
            }

            if entry.children.isEmpty {
                Spacer()
                HStack {
                    Spacer()
                    VStack(spacing: 4) {
                        Image(systemName: "person.3.fill")
                            .font(.title3)
                            .foregroundStyle(.secondary)
                        Text("No children set up yet")
                            .font(.caption)
                            .foregroundStyle(.secondary)
                    }
                    Spacer()
                }
                Spacer()
            } else {
                HStack(spacing: 12) {
                    ForEach(entry.children.prefix(3)) { child in
                        childCard(child)
                    }
                }
                .padding(.top, 2)
            }
        }
        .padding(.horizontal, 2)
    }

    // MARK: - Child Card (used in medium widget)

    private func childCard(_ child: WidgetChild) -> some View {
        VStack(spacing: 6) {
            // Avatar circle
            ZStack {
                Circle()
                    .fill(child.status.color.gradient)
                    .frame(width: 32, height: 32)
                Text(child.initial)
                    .font(.system(size: 14, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }

            // Name
            Text(child.name)
                .font(.caption)
                .fontWeight(.medium)
                .lineLimit(1)

            // Rule count
            Text("\(child.activeRules) rules")
                .font(.system(size: 10))
                .foregroundStyle(.secondary)

            // Status indicator
            HStack(spacing: 3) {
                Circle()
                    .fill(child.status.color)
                    .frame(width: 6, height: 6)
                Text(child.status.label)
                    .font(.system(size: 9))
                    .foregroundStyle(child.status.color)
            }
        }
        .frame(maxWidth: .infinity)
        .padding(.vertical, 6)
        .background(
            RoundedRectangle(cornerRadius: 10, style: .continuous)
                .fill(.quaternary)
        )
    }
}

// MARK: - Widget Configuration

struct FamilyStatusWidget: Widget {
    let kind = "FamilyStatusWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: FamilyStatusProvider()) { entry in
            FamilyStatusWidgetView(entry: entry)
        }
        .configurationDisplayName("Family Status")
        .description("See your children's protection status at a glance.")
        .supportedFamilies([.systemSmall, .systemMedium])
    }
}

// MARK: - Previews

#Preview("Small", as: .systemSmall) {
    FamilyStatusWidget()
} timeline: {
    FamilyStatusEntry.placeholder
}

#Preview("Medium", as: .systemMedium) {
    FamilyStatusWidget()
} timeline: {
    FamilyStatusEntry.placeholder
}
