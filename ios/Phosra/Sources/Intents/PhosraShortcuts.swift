import AppIntents

struct PhosraShortcuts: AppShortcutsProvider {
    /// Navy tile background — matches Phosra brand dark palette
    static let shortcutTileColor: ShortcutTileColor = .navy

    static var appShortcuts: [AppShortcut] {
        return [
            // — Family & Setup —
            AppShortcut(
                intent: CheckFamilyIntent(),
                phrases: [
                    "Show my family in \(.applicationName)",
                    "Who's in my family in \(.applicationName)"
                ],
                shortTitle: "My Family",
                systemImageName: "person.3.fill"
            ),
            AppShortcut(
                intent: AddChildIntent(),
                phrases: [
                    "Add a child to my family in \(.applicationName)",
                    "Protect a child with \(.applicationName)",
                    "Set up a child in \(.applicationName)"
                ],
                shortTitle: "Add Child",
                systemImageName: "person.crop.circle.badge.plus"
            ),

            // — Monitoring —
            AppShortcut(
                intent: CheckScreenTimeIntent(),
                phrases: [
                    "Check \(\.$child)'s screen time in \(.applicationName)",
                    "How much screen time has \(\.$child) used in \(.applicationName)",
                    "Show \(\.$child)'s activity in \(.applicationName)"
                ],
                shortTitle: "Screen Time",
                systemImageName: "chart.bar.fill"
            ),
            AppShortcut(
                intent: CheckPoliciesIntent(),
                phrases: [
                    "What rules are active for \(\.$child) in \(.applicationName)",
                    "Show \(\.$child)'s rules in \(.applicationName)"
                ],
                shortTitle: "Check Rules",
                systemImageName: "shield.checkered"
            ),

            // — Controls —
            AppShortcut(
                intent: PauseInternetIntent(),
                phrases: [
                    "Pause \(\.$child)'s internet in \(.applicationName)",
                    "Shut it down for \(\.$child) in \(.applicationName)",
                    "Block internet for \(\.$child) in \(.applicationName)"
                ],
                shortTitle: "Pause Internet",
                systemImageName: "wifi.slash"
            ),
            AppShortcut(
                intent: ResumeInternetIntent(),
                phrases: [
                    "Resume \(\.$child)'s internet in \(.applicationName)",
                    "Unpause \(\.$child) in \(.applicationName)"
                ],
                shortTitle: "Resume Internet",
                systemImageName: "wifi"
            ),
            AppShortcut(
                intent: ExtendTimeIntent(),
                phrases: [
                    "Give \(\.$child) more time in \(.applicationName)",
                    "Extend \(\.$child)'s screen time in \(.applicationName)"
                ],
                shortTitle: "Extend Time",
                systemImageName: "clock.badge.plus"
            ),
            AppShortcut(
                intent: BlockAppIntent(),
                phrases: [
                    "Block an app for \(\.$child) in \(.applicationName)"
                ],
                shortTitle: "Block App",
                systemImageName: "xmark.app.fill"
            ),

            // — Routines —
            AppShortcut(
                intent: SetBedtimeIntent(),
                phrases: [
                    "Set bedtime for \(\.$child) in \(.applicationName)",
                    "Change \(\.$child)'s bedtime in \(.applicationName)"
                ],
                shortTitle: "Set Bedtime",
                systemImageName: "moon.fill"
            ),
            AppShortcut(
                intent: BedtimeRoutineIntent(),
                phrases: [
                    "It's bedtime in \(.applicationName)",
                    "Start bedtime routine in \(.applicationName)",
                    "Wind down the kids in \(.applicationName)"
                ],
                shortTitle: "Bedtime Routine",
                systemImageName: "moon.stars.fill"
            ),
        ]
    }
}
