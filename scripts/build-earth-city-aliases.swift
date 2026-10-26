// Add Simplified Chinese aliases using the system Foundation/ICU transform.
// Usage: swift -module-cache-path /tmp/iris-earth-swift-cache scripts/build-earth-city-aliases.swift assets/earth-cities.json
import Foundation
let path = CommandLine.arguments[1]
let data = try Data(contentsOf: URL(fileURLWithPath:path))
var rows = try JSONSerialization.jsonObject(with:data) as! [[Any]]
var added=0
for i in rows.indices {
 var aliases=rows[i][6] as! [String]
 for alias in aliases {
  if let simplified=alias.applyingTransform(StringTransform("Traditional-Simplified"),reverse:false), !aliases.contains(simplified) {aliases.append(simplified);added+=1}
 }
 rows[i][6]=aliases
}
try JSONSerialization.data(withJSONObject:rows,options:[.withoutEscapingSlashes]).write(to:URL(fileURLWithPath:path))
print("Added \(added) simplified aliases to \(rows.count) cities")
