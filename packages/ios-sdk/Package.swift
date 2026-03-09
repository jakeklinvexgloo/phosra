// swift-tools-version: 5.9
// The PhosraSDK Swift package.
// Install via SPM: https://github.com/jakeklinvexgloo/phosra-ios-sdk.git

import PackageDescription

let package = Package(
    name: "PhosraSDK",
    platforms: [
        .iOS(.v16),
        .macOS(.v13)
    ],
    products: [
        .library(name: "PhosraSDK", targets: ["PhosraSDK"])
    ],
    targets: [
        .target(
            name: "PhosraSDK",
            path: "Sources/PhosraSDK"
        )
    ]
)
