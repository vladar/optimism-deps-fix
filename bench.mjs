import { execa } from "execa";

async function runOnce(enableFix) {
  const args = ["--expose-gc", "run.js"];
  if (enableFix) {
    args.push("--enable-fix");
  }
  const result = await execa("node", args);

  if (result.stderr.length) {
    console.log({ result });
    throw new Error(result.stderr);
  }

  const [withFix, heapUsedStr] = result.stdout.split("|");

  if (
    (withFix !== "with-fix" && withFix !== "no-fix") ||
    isNaN(Number(heapUsedStr))
  ) {
    throw new Error("Unexpected output");
  }

  return { withFix: withFix === "with-fix", heapUsed: Number(heapUsedStr) };
}

async function runSeries(enableFix) {
  const iterations = [];
  for (let i = 0; i < 10; i++) {
    const result = await runOnce(enableFix);
    iterations.push(result);
  }
  const sum = iterations.reduce(
    (acc, iteration) => acc + iteration.heapUsed,
    0
  );
  return {
    jsHeapAvg: sum / iterations.length,
  };
}

async function run() {
  const withFix = await runSeries(true);
  const withoutFix = await runSeries(false);

  const delta = withoutFix.jsHeapAvg - withFix.jsHeapAvg;
  const percent = delta * 100 / withoutFix.jsHeapAvg
  const result = `Version with the fix has ${percent.toFixed(1)}% smaller JS heap`

  console.info({ withFix, withoutFix });
  console.log(``)
  console.log(result);
}

run().catch(console.error);
