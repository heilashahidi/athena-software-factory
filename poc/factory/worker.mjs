// The worker is the one swappable, stochastic slot. Every worker shares one model;
// only the harness (context + skills + memory + tools + eval) differs per stage.
//
// The POC ships a deterministic TemplateWorker so the demo is reproducible and the
// harness — conductor, typed handoffs, gates, CI-in-the-loop — can be proven end to
// end. An LlmWorker drops in behind this same interface, gated by the IDENTICAL evals:
//
//   class LlmWorker {
//     generate(stage, harness) {
//       return parse(callModel(promptFor(stage.skill, harness.context)));
//     }
//   }
//
import { skills } from "./skills.mjs";

export class TemplateWorker {
  generate(stage, harness) {
    const skill = skills[stage.id];
    if (!skill) throw new Error("no skill for stage " + stage.id);
    return skill(harness.spec, harness);
  }
}
