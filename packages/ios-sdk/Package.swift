// swift-tools-version: 5.9
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
