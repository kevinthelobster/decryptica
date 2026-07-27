export type HardwareType = 'apple-silicon' | 'windows-gpu' | 'windows-cpu' | 'linux-gpu' | 'linux-cpu';
export type UseCase = 'chat' | 'coding' | 'research' | 'agents';
export type ModelSize = '3b' | '7b' | '8b' | '14b' | '32b' | '70b';
export type QuantLevel = 'q4' | 'q5' | 'q8';

export type ModelRequirement = {
  id: ModelSize;
  label: string;
  examples: string;
  q4MemoryGb: number;
  q5MemoryGb: number;
  q8MemoryGb: number;
  diskGb: number;
  useCase: string;
};

export const modelRequirements: ModelRequirement[] = [
  {
    id: '3b',
    label: '3B class',
    examples: 'Phi, Gemma, Qwen small models',
    q4MemoryGb: 3,
    q5MemoryGb: 4,
    q8MemoryGb: 6,
    diskGb: 3,
    useCase: 'Fast drafts, simple chat, light extraction, small helper bots.',
  },
  {
    id: '7b',
    label: '7B class',
    examples: 'Mistral 7B, CodeLlama 7B, similar small open models',
    q4MemoryGb: 5,
    q5MemoryGb: 6,
    q8MemoryGb: 9,
    diskGb: 5,
    useCase: 'Everyday chat, summarizing, basic coding help, lightweight private assistants.',
  },
  {
    id: '8b',
    label: '8B class',
    examples: 'Llama 3.1 8B, Qwen 8B, similar mainstream local models',
    q4MemoryGb: 6,
    q5MemoryGb: 7,
    q8MemoryGb: 10,
    diskGb: 6,
    useCase: 'Best beginner target for most laptops: chat, writing, research, and moderate coding.',
  },
  {
    id: '14b',
    label: '14B class',
    examples: 'Qwen 14B, Gemma larger local models',
    q4MemoryGb: 10,
    q5MemoryGb: 12,
    q8MemoryGb: 18,
    diskGb: 10,
    useCase: 'Stronger reasoning than 7B/8B, usually slower on laptops.',
  },
  {
    id: '32b',
    label: '32B class',
    examples: 'Qwen 32B, DeepSeek Coder 33B style models',
    q4MemoryGb: 22,
    q5MemoryGb: 26,
    q8MemoryGb: 40,
    diskGb: 22,
    useCase: 'Serious local coding and analysis on high-memory Macs or GPU workstations.',
  },
  {
    id: '70b',
    label: '70B class',
    examples: 'Llama 70B, Qwen 72B, large frontier-adjacent open models',
    q4MemoryGb: 44,
    q5MemoryGb: 52,
    q8MemoryGb: 80,
    diskGb: 44,
    useCase: 'High quality local inference, but hardware demands are workstation-class.',
  },
];

export function getModelRequirement(id: ModelSize) {
  return modelRequirements.find((model) => model.id === id) || modelRequirements[2];
}

export function memoryForQuant(model: ModelRequirement, quant: QuantLevel) {
  if (quant === 'q8') return model.q8MemoryGb;
  if (quant === 'q5') return model.q5MemoryGb;
  return model.q4MemoryGb;
}

export function quantLabel(quant: QuantLevel) {
  if (quant === 'q8') return 'Q8 quality';
  if (quant === 'q5') return 'Q5 balanced';
  return 'Q4 practical';
}

export function usableMemoryGb(args: { hardwareType: HardwareType; ramGb: number; vramGb: number }) {
  if (args.hardwareType === 'apple-silicon') return Math.max(0, Math.floor(args.ramGb * 0.75));
  if (args.hardwareType === 'windows-gpu' || args.hardwareType === 'linux-gpu') {
    return Math.max(args.vramGb, Math.floor(args.ramGb * 0.65));
  }
  return Math.max(0, Math.floor(args.ramGb * 0.65));
}

export function runnerRecommendation(hardwareType: HardwareType) {
  if (hardwareType === 'apple-silicon') return 'Ollama or LM Studio with Metal acceleration';
  if (hardwareType === 'windows-gpu') return 'LM Studio or Ollama with NVIDIA acceleration';
  if (hardwareType === 'linux-gpu') return 'Ollama, llama.cpp, or vLLM for advanced setups';
  return 'Ollama or llama.cpp, expecting slower CPU-only inference';
}

export function hardwareLabel(hardwareType: HardwareType) {
  if (hardwareType === 'apple-silicon') return 'Apple Silicon Mac';
  if (hardwareType === 'windows-gpu') return 'Windows PC with GPU';
  if (hardwareType === 'linux-gpu') return 'Linux workstation with GPU';
  if (hardwareType === 'linux-cpu') return 'Linux CPU-only machine';
  return 'Windows CPU-only PC';
}

export function speedVerdict(headroom: number, model: ModelRequirement, hardwareType: HardwareType) {
  if (headroom >= 18 && model.q4MemoryGb <= 12) return 'Smooth';
  if (headroom >= 8) return 'Comfortable';
  if (headroom >= 2) return 'Usable';
  if (headroom >= -4) return 'Possible but slow';
  if (hardwareType.includes('cpu')) return 'Technically possible, likely painful';
  return 'Not recommended';
}

export function useCaseAdvice(useCase: UseCase, largestComfortable?: ModelRequirement) {
  if (!largestComfortable) return 'Start with a 3B or 7B Q4 model before buying hardware.';
  if (useCase === 'coding' && largestComfortable.q4MemoryGb < 10) {
    return 'For coding, start with an 8B coding model. Upgrade hardware before expecting strong repo-level help.';
  }
  if (useCase === 'agents') {
    return 'Agents need extra memory for tools, browser sessions, and context. Leave more headroom than chat.';
  }
  if (useCase === 'research') {
    return 'Research workflows benefit from context length and speed. A smaller model that responds quickly may beat a larger model that crawls.';
  }
  return 'For general chat, a comfortable 7B or 8B model is usually the best first install.';
}
