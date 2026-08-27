// patra-learn/src/content/articles/index.ts —— 静态注册表（SSG 需要全部静态 import）
import type { ComponentType } from "react";
import type { StationRef } from "../types";
import ChangedOnly from "./l1/changed-only";
import OpenPr from "./l1/open-pr";
import ParallelExams from "./l1/parallel-exams";
import WriteCode from "./l1/write-code";
import DeployLoop from "./l2/deploy-loop";
import HealthCheck from "./l2/health-check";
import NativeBuild from "./l2/native-build";
import RunnerPicksUp from "./l2/runner-picks-up";
import ShipAndRollback from "./l2/ship-and-rollback";
import Daily0700 from "./l3/daily-0700";
import FourChecks from "./l3/four-checks";
import NotificationPhilosophy from "./l3/notification-philosophy";
import RollCallAndKey from "./l3/roll-call-and-key";

export const ARTICLES: Record<StationRef, ComponentType> = {
  "l1/write-code": WriteCode,
  "l1/open-pr": OpenPr,
  "l1/changed-only": ChangedOnly,
  "l1/parallel-exams": ParallelExams,
  "l2/runner-picks-up": RunnerPicksUp,
  "l2/native-build": NativeBuild,
  "l2/deploy-loop": DeployLoop,
  "l2/health-check": HealthCheck,
  "l2/ship-and-rollback": ShipAndRollback,
  "l3/daily-0700": Daily0700,
  "l3/roll-call-and-key": RollCallAndKey,
  "l3/four-checks": FourChecks,
  "l3/notification-philosophy": NotificationPhilosophy,
};
