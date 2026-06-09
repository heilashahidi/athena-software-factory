// Plan generator: spec -> typed task DAG. The only creative planning step;
// its output is structured and (in the full system) human-approved before anything runs.
import { createHash } from "node:crypto";

export function generatePlan(spec) {
  const stages = [
    { id: "migrate", type: "db_migration", dependsOn: [] },
    { id: "api", type: "rest_endpoints", dependsOn: ["migrate"] },
  ];
  const hasUi = spec.ui && (spec.ui.list || spec.ui.detail || spec.ui.form);
  if (hasUi) stages.push({ id: "frontend", type: "react_components", dependsOn: ["api"] });
  stages.push({ id: "tests", type: "test_suite", dependsOn: hasUi ? ["api", "frontend"] : ["api"] });
  stages.push({ id: "config", type: "feature_flags_and_permissions", dependsOn: [] });

  return {
    planId: "pf-" + createHash("sha1").update(spec.specId).digest("hex").slice(0, 8),
    stages,
    requiresHumanApprovalBefore: ["migrate"],
    estimatedFiles: stages.length + spec.fields.length,
  };
}
