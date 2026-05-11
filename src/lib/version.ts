import packageJson from "../../package.json";

/** Application SemVer from package.json (bumped per release process). */
export function getAppVersion(): string {
  return packageJson.version;
}
