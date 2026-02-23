import Foundation

extension Data {
    /// Encodes the data as a lowercase hexadecimal string.
    ///
    /// Example: `Data([0xDE, 0xAD, 0xBE, 0xEF]).hexEncodedString()` returns `"deadbeef"`.
    func hexEncodedString() -> String {
        return map { String(format: "%02x", $0) }.joined()
    }

    /// Creates `Data` from a hexadecimal string.
    ///
    /// - Parameter hex: A hex string (e.g., "deadbeef"). Must have an even number of characters.
    /// - Returns: The decoded data, or `nil` if the hex string is invalid.
    static func fromHex(_ hex: String) -> Data? {
        let cleanHex = hex.lowercased().filter { $0.isHexDigit }
        guard cleanHex.count % 2 == 0 else { return nil }

        var data = Data()
        data.reserveCapacity(cleanHex.count / 2)

        var index = cleanHex.startIndex
        while index < cleanHex.endIndex {
            let nextIndex = cleanHex.index(index, offsetBy: 2)
            let byteString = cleanHex[index..<nextIndex]
            guard let byte = UInt8(byteString, radix: 16) else { return nil }
            data.append(byte)
            index = nextIndex
        }

        return data
    }
}
