export type TrainingSample = { title: string; text: string; pending?: boolean }

export function parseTrainingLog(lines: string[]) {
  let status = 'Preparing model for training…'
  let outcome: 'completed' | 'failed' | 'interrupted' | undefined
  let saved: string | undefined
  let sample: TrainingSample | undefined
  const samples: TrainingSample[] = []
  const diagnostics: string[] = []
  // A bounded log tail can start inside a sample. Its first end marker tells
  // us that the leading lines are generated text, even if they look like logs.
  const firstHeader = lines.findIndex((line) =>
    /^======== SAMPLE \d+ ========$/.test(line),
  )
  const firstEnd = lines.indexOf('======== END SAMPLE ========')
  if (firstEnd >= 0 && (firstHeader < 0 || firstEnd < firstHeader)) {
    sample = { title: 'Sample (continued)', text: '', pending: true }
    samples.push(sample)
  }

  for (const [index, line] of lines.entries()) {
    const header = line.match(/^======== SAMPLE (\d+) ========$/)
    if (header) {
      sample = { title: `Sample ${header[1]}`, text: '', pending: true }
      samples.push(sample)
      continue
    }
    if (line === '======== END SAMPLE ========') {
      if (sample) {
        sample.pending = false
      }
      sample = undefined
      continue
    }
    if (sample) {
      // The last snapshot line may still be in progress. Only restore
      // newlines that are established by a following line in the snapshot.
      sample.text += line + (index < lines.length - 1 ? '\n' : '')
      continue
    }
    diagnostics.push(line)
    const progress = line.match(/^\[\d+, (\d+)\/(\d+) \| [\d.]+\] loss=/)
    const saving = line.match(/^Saving model-(\d+)$/)
    const checkpoint = line.match(/^Saved model-(\d+)$/)
    if (line.startsWith('Loading checkpoint ')) {
      status = 'Loading model weights…'
    } else if (line === 'Loading dataset') {
      status = 'Loading training data…'
    } else if (progress) {
      status = `Training · ${Number(progress[1]).toLocaleString()} of ${Number(
        progress[2],
      ).toLocaleString()} steps completed`
    } else if (line === 'Generating samples...') {
      status = 'Generating samples…'
    } else if (saving) {
      status = `Saving checkpoint ${saving[1]}…`
    } else if (checkpoint) {
      saved = checkpoint[1]
      status = `Checkpoint ${saved} saved`
    } else if (line === 'Training completed') {
      outcome = 'completed'
    } else if (line.startsWith('Training failed:')) {
      outcome = 'failed'
    } else if (line === 'Interrupted') {
      outcome = 'interrupted'
    }
  }
  return { status, outcome, saved, samples, diagnostics }
}
