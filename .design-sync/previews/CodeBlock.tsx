import { CodeBlock } from "patra-learn";

export const SingleCommand = () => (
  <div style={{ maxWidth: 440 }}>
    <CodeBlock command="gh workflow run runner-watchdog.yml" />
  </div>
);

export const MultiLineCommand = () => (
  <div style={{ maxWidth: 440 }}>
    <CodeBlock
      command={"gh workflow run cd.yml \\\n  -f service=catalog \\\n  -f image_tag=<旧sha>"}
    />
  </div>
);

export const LongCommand = () => (
  <div style={{ maxWidth: 440 }}>
    <CodeBlock
      command={"bash patra-infra/scripts/install-github-runner.sh \\\n  <TOKEN>"}
    />
  </div>
);
