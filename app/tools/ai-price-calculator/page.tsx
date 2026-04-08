import { Metadata } from 'next';
import Calculator from './Calculator';

export const metadata: Metadata = {
  title: 'AI API Price Comparator | Decryptica',
  description: 'Compare AI API pricing across OpenAI, Anthropic, Google, xAI, and more. Find the cheapest provider for your use case.',
};

export default function AIPriceCalculatorPage() {
  return <Calculator />;
}
