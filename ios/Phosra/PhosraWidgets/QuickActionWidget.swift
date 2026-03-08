import WidgetKit
import SwiftUI
import AppIntents

// MARK: - Timeline Entry

struct QuickActionEntry: TimelineEntry {
    let date: Date
    let children: [QuickActionChild]
    let isPlaceholder: Bool

    static var placeholder: QuickActionEntry {
        QuickActionEntry(
            date: .now,
            children: [
                QuickActionChild(id: "1", name: "Emma", age: 8, isPaused: false, status: .protected),
                QuickActionChild(id: "2", name: "Liam", age: 5, isPaused: false, status: .protected),
                QuickActionChild(id: "3", name: "Ava", age: 12, isPaused: true, status: .paused),
            ],
            isPlaceholder: true
        )
    }

    static var empty: QuickActionEntry {
        QuickActionEntry(date: .now, children: [], isPlaceholder: false)
    }
}

// MARK: - Quick Action Child Model

struct QuickActionChild: Identifiable {
    let id: String
    let name: String
    let age: Int
    let isPaused: Bool
    let status: WidgetChild.ChildStatus

    var initial: String {
        String(name.prefix(1)).uppercased()
    }
}

// MARK: - App Intents for Interactive Buttons

/// Pauses or resumes internet for a specific child directly from the widget.
struct WidgetPauseIntent: AppIntent {
    static let title: LocalizedStringResource = "Toggle Pause"
    static let description = IntentDescription("Pause or resume internet for a child.")

    @Parameter(title: "Child ID")
    var childId: String

    @Parameter(title: "Child Name")
    var childName: String

    @Parameter(title: "Currently Paused")
    var isPaused: Bool

    init() {}

    init(childId: String, childName: String, isPaused: Bool) {
        self.childId = childId
        self.childName = childName
        self.isPaused = isPaused
    }

    func perform() async throws -> some IntentResult {
        guard let token = WidgetKeychain.getSessionToken() else {
            return .result()
        }

        let path = isPaused
            ? "/children/\(childId)/emergency-resume"
            : "/children/\(childId)/emergency-pause"

        guard let url = URL(string: "https://phosra-api.fly.dev/api/v1\(path)") else {
            return .result()
        }

        var request = URLRequest(url: url)
        request.httpMethod = "POST"
        request.setValue("application/json", forHTTPHeaderField: "Content-Type")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        _ = try? await URLSession.shared.data(for: request)

        // Reload widget timeline to reflect the new state
        WidgetCenter.shared.reloadTimelines(ofKind: "QuickActionWidget")

        return .result()
    }
}

/// Extends screen time by a fixed number of minutes for a child.
struct WidgetExtendTimeIntent: AppIntent {
    static let title: LocalizedStringResource = "Extend Time"
    static let description = IntentDescription("Give a child extra screen time minutes.")

    @Parameter(title: "Child ID")
    var childId: String

    @Parameter(title: "Child Name")
    var childName: String

    @Parameter(title: "Minutes")
    var minutes: Int

    init() {}

    init(childId: String, childName: String, minutes: Int) {
        self.childId = childId
        self.childName = childName
        self.minutes = minutes
    }

    func perform() async throws -> some IntentResult {
        guard let token = WidgetKeychain.getSessionToken() else {
            return .result()
        }

        // Fetch active policy, then upsert the time_daily_limit rule
        guard let url = URL(string: "https://phosra-api.fly.dev/api/v1/children/\(childId)/policies") else {
            return .result()
        }

        var request = URLRequest(url: url)
        request.httpMethod = "GET"
        request.setValue("application/json", forHTTPHeaderField: "Accept")
        request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        request.timeoutInterval = 10

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        guard let (data, response) = try? await URLSession.shared.data(for: request),
              let httpResponse = response as? HTTPURLResponse,
              httpResponse.statusCode == 200,
              let policies = try? decoder.decode([WidgetPolicyModel].self, from: data),
              let activePolicy = policies.first(where: { $0.status == "active" }) else {
            return .result()
        }

        // Upsert the time_daily_limit rule with extended minutes
        guard let upsertURL = URL(string: "https://phosra-api.fly.dev/api/v1/policies/\(activePolicy.id)/rules/bulk") else {
            return .result()
        }

        var upsertRequest = URLRequest(url: upsertURL)
        upsertRequest.httpMethod = "PUT"
        upsertRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
        upsertRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        upsertRequest.timeoutInterval = 10

        // Add 30 minutes to a default of 120
        let body: [String: Any] = [
            "rules": [[
                "category": "time_daily_limit",
                "enabled": true,
                "config": ["max_minutes": 120 + minutes]
            ] as [String: Any]]
        ]
        upsertRequest.httpBody = try? JSONSerialization.data(withJSONObject: body)

        _ = try? await URLSession.shared.data(for: upsertRequest)

        WidgetCenter.shared.reloadTimelines(ofKind: "QuickActionWidget")

        return .result()
    }
}

/// Pauses internet for ALL children at once (bedtime routine).
struct WidgetBedtimeRoutineIntent: AppIntent {
    static let title: LocalizedStringResource = "Bedtime Routine"
    static let description = IntentDescription("Pause internet for all children at bedtime.")

    init() {}

    func perform() async throws -> some IntentResult {
        guard let token = WidgetKeychain.getSessionToken() else {
            return .result()
        }

        let decoder = JSONDecoder()
        decoder.keyDecodingStrategy = .convertFromSnakeCase

        // Fetch families
        guard let familiesURL = URL(string: "https://phosra-api.fly.dev/api/v1/families") else {
            return .result()
        }
        var familiesRequest = URLRequest(url: familiesURL)
        familiesRequest.httpMethod = "GET"
        familiesRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        familiesRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        familiesRequest.timeoutInterval = 10

        guard let (familiesData, familiesResp) = try? await URLSession.shared.data(for: familiesRequest),
              let httpResp = familiesResp as? HTTPURLResponse,
              httpResp.statusCode == 200,
              let families = try? decoder.decode([WidgetFamilyModel].self, from: familiesData),
              let family = families.first else {
            return .result()
        }

        // Fetch children
        guard let childrenURL = URL(string: "https://phosra-api.fly.dev/api/v1/families/\(family.id)/children") else {
            return .result()
        }
        var childrenRequest = URLRequest(url: childrenURL)
        childrenRequest.httpMethod = "GET"
        childrenRequest.setValue("application/json", forHTTPHeaderField: "Accept")
        childrenRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
        childrenRequest.timeoutInterval = 10

        guard let (childrenData, childrenResp) = try? await URLSession.shared.data(for: childrenRequest),
              let childrenHttpResp = childrenResp as? HTTPURLResponse,
              childrenHttpResp.statusCode == 200,
              let children = try? decoder.decode([WidgetChildModel].self, from: childrenData) else {
            return .result()
        }

        // Pause each child
        for child in children {
            guard let pauseURL = URL(string: "https://phosra-api.fly.dev/api/v1/children/\(child.id)/emergency-pause") else {
                continue
            }
            var pauseRequest = URLRequest(url: pauseURL)
            pauseRequest.httpMethod = "POST"
            pauseRequest.setValue("application/json", forHTTPHeaderField: "Content-Type")
            pauseRequest.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
            pauseRequest.timeoutInterval = 10
            _ = try? await URLSession.shared.data(for: pauseRequest)
        }

        WidgetCenter.shared.reloadTimelines(ofKind: "QuickActionWidget")
        WidgetCenter.shared.reloadTimelines(ofKind: "FamilyStatusWidget")

        return .result()
    }
}

// MARK: - Lightweight API Models (Widget-only)

private struct WidgetFamilyModel: Decodable {
    let id: String
    let name: String
}

private struct WidgetChildModel: Decodable {
    let id: String
    let name: String
}

private struct WidgetPolicyModel: Decodable {
    let id: String
    let status: String
}

// MARK: - Timeline Provider

struct QuickActionProvider: TimelineProvider {

    private let baseURL = "https://phosra-api.fly.dev/api/v1"

    func placeholder(in context: Context) -> QuickActionEntry {
        .placeholder
    }

    func getSnapshot(in context: Context, completion: @escaping (QuickActionEntry) -> Void) {
        if context.isPreview {
            completion(.placeholder)
        } else {
            fetchData { entry in
                completion(entry ?? .placeholder)
            }
        }
    }

    func getTimeline(in context: Context, completion: @escaping (Timeline<QuickActionEntry>) -> Void) {
        fetchData { entry in
            let currentEntry = entry ?? .empty
            let refreshDate = Calendar.current.date(byAdding: .minute, value: 30, to: .now) ?? .now
            let timeline = Timeline(entries: [currentEntry], policy: .after(refreshDate))
            completion(timeline)
        }
    }

    // MARK: - Data Fetching

    private func fetchData(completion: @escaping (QuickActionEntry?) -> Void) {
        guard let token = WidgetKeychain.getSessionToken() else {
            completion(nil)
            return
        }

        performRequest(path: "/families", token: token) { (families: [WidgetFamilyModel]?) in
            guard let family = families?.first else {
                completion(nil)
                return
            }

            self.performRequest(path: "/families/\(family.id)/children", token: token) { (children: [QuickActionAPIChild]?) in
                guard let children = children, !children.isEmpty else {
                    completion(nil)
                    return
                }

                let group = DispatchGroup()
                var actionChildren: [QuickActionChild] = []
                let lock = NSLock()

                for child in children.prefix(4) {
                    group.enter()
                    self.performRequest(
                        path: "/children/\(child.id)/policies",
                        token: token
                    ) { (policies: [WidgetPolicyModel]?) in
                        let activePolicy = policies?.first(where: { $0.status == "active" })
                        let isPaused = activePolicy?.status == "paused"
                        let status: WidgetChild.ChildStatus = {
                            guard let policy = activePolicy else { return .alert }
                            switch policy.status {
                            case "active":  return .protected
                            case "paused":  return .paused
                            default:        return .alert
                            }
                        }()

                        let actionChild = QuickActionChild(
                            id: child.id,
                            name: child.name,
                            age: child.calculatedAge,
                            isPaused: isPaused,
                            status: status
                        )

                        lock.lock()
                        actionChildren.append(actionChild)
                        lock.unlock()

                        group.leave()
                    }
                }

                group.notify(queue: .main) {
                    let sorted = actionChildren.sorted { $0.name < $1.name }
                    let entry = QuickActionEntry(date: .now, children: sorted, isPlaceholder: false)
                    completion(entry)
                }
            }
        }
    }

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

/// Minimal child model for the quick action provider.
private struct QuickActionAPIChild: Decodable {
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

// MARK: - Widget View

struct QuickActionWidgetView: View {
    @Environment(\.widgetFamily) var widgetFamily
    var entry: QuickActionEntry

    var body: some View {
        Group {
            switch widgetFamily {
            case .systemMedium:
                mediumView
            case .systemLarge:
                largeView
            default:
                mediumView
            }
        }
        .containerBackground(.fill.tertiary, for: .widget)
    }

    // MARK: - Medium Widget (Pause toggles per child)

    private var mediumView: some View {
        VStack(alignment: .leading, spacing: 4) {
            // Header
            HStack {
                Image(systemName: "bolt.shield.fill")
                    .font(.caption2)
                    .foregroundStyle(.secondary)
                Text("Quick Actions")
                    .font(.caption2)
                    .fontWeight(.semibold)
                    .foregroundStyle(.secondary)
                Spacer()
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
                ForEach(entry.children.prefix(3)) { child in
                    childRow(child, showExtend: false)
                }
            }
        }
        .padding(.horizontal, 2)
    }

    // MARK: - Large Widget (Pause + Extend per child + Pause All)

    private var largeView: some View {
        VStack(alignment: .leading, spacing: 6) {
            // Header
            HStack {
                Image(systemName: "bolt.shield.fill")
                    .font(.caption)
                    .foregroundStyle(.secondary)
                Text("Quick Actions")
                    .font(.caption)
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
                    VStack(spacing: 8) {
                        Image(systemName: "person.3.fill")
                            .font(.title2)
                            .foregroundStyle(.secondary)
                        Text("No children set up yet")
                            .font(.subheadline)
                            .foregroundStyle(.secondary)
                        Text("Open Phosra to add your family")
                            .font(.caption)
                            .foregroundStyle(.tertiary)
                    }
                    Spacer()
                }
                Spacer()
            } else {
                ForEach(entry.children.prefix(4)) { child in
                    childRow(child, showExtend: true)
                }

                Spacer()

                // Pause All / Bedtime Routine button
                Button(intent: WidgetBedtimeRoutineIntent()) {
                    HStack {
                        Spacer()
                        Image(systemName: "moon.stars.fill")
                            .font(.caption)
                        Text("Pause All — Bedtime")
                            .font(.caption)
                            .fontWeight(.semibold)
                        Spacer()
                    }
                    .padding(.vertical, 8)
                    .background(
                        RoundedRectangle(cornerRadius: 8, style: .continuous)
                            .fill(.red.gradient)
                    )
                    .foregroundStyle(.white)
                }
                .buttonStyle(.plain)
            }
        }
        .padding(.horizontal, 2)
    }

    // MARK: - Child Row

    private func childRow(_ child: QuickActionChild, showExtend: Bool) -> some View {
        HStack(spacing: 8) {
            // Avatar
            ZStack {
                Circle()
                    .fill(child.status.color.gradient)
                    .frame(width: 28, height: 28)
                Text(child.initial)
                    .font(.system(size: 12, weight: .bold, design: .rounded))
                    .foregroundStyle(.white)
            }

            // Name + status
            VStack(alignment: .leading, spacing: 1) {
                Text(child.name)
                    .font(.caption)
                    .fontWeight(.medium)
                    .lineLimit(1)
                Text(child.status.label)
                    .font(.system(size: 9))
                    .foregroundStyle(child.status.color)
            }

            Spacer()

            // Action buttons
            HStack(spacing: 6) {
                // Pause / Resume toggle
                Button(intent: WidgetPauseIntent(
                    childId: child.id,
                    childName: child.name,
                    isPaused: child.isPaused
                )) {
                    HStack(spacing: 3) {
                        Image(systemName: child.isPaused ? "play.fill" : "wifi.slash")
                            .font(.system(size: 9))
                        Text(child.isPaused ? "Resume" : "Pause")
                            .font(.system(size: 10, weight: .medium))
                    }
                    .padding(.horizontal, 8)
                    .padding(.vertical, 5)
                    .background(
                        RoundedRectangle(cornerRadius: 6, style: .continuous)
                            .fill(child.isPaused ? Color.green.opacity(0.2) : Color.orange.opacity(0.2))
                    )
                    .foregroundStyle(child.isPaused ? .green : .orange)
                }
                .buttonStyle(.plain)

                // Extend 30m button (large widget only)
                if showExtend {
                    Button(intent: WidgetExtendTimeIntent(
                        childId: child.id,
                        childName: child.name,
                        minutes: 30
                    )) {
                        HStack(spacing: 3) {
                            Image(systemName: "clock.badge.plus")
                                .font(.system(size: 9))
                            Text("+30m")
                                .font(.system(size: 10, weight: .medium))
                        }
                        .padding(.horizontal, 8)
                        .padding(.vertical, 5)
                        .background(
                            RoundedRectangle(cornerRadius: 6, style: .continuous)
                                .fill(Color.blue.opacity(0.2))
                        )
                        .foregroundStyle(.blue)
                    }
                    .buttonStyle(.plain)
                }
            }
        }
        .padding(.vertical, 3)
        .padding(.horizontal, 6)
        .background(
            RoundedRectangle(cornerRadius: 8, style: .continuous)
                .fill(.quaternary)
        )
    }
}

// MARK: - Widget Configuration

struct QuickActionWidget: Widget {
    let kind = "QuickActionWidget"

    var body: some WidgetConfiguration {
        StaticConfiguration(kind: kind, provider: QuickActionProvider()) { entry in
            QuickActionWidgetView(entry: entry)
        }
        .configurationDisplayName("Quick Actions")
        .description("Pause internet or extend screen time right from your Home Screen.")
        .supportedFamilies([.systemMedium, .systemLarge])
    }
}

// MARK: - Previews

#Preview("Medium", as: .systemMedium) {
    QuickActionWidget()
} timeline: {
    QuickActionEntry.placeholder
}

#Preview("Large", as: .systemLarge) {
    QuickActionWidget()
} timeline: {
    QuickActionEntry.placeholder
}
