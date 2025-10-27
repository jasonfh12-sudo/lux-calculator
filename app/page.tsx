'use client';

import { useState } from 'react';

// ElevenLabs pricing tiers (converted to annual from monthly plans)
const ORCHESTRATION_TIERS = [
  { maxAnnualMinutes: 180, costPerMinute: Infinity, name: "Free" }, // 15 min/mo - no additional
  { maxAnnualMinutes: 600, costPerMinute: Infinity, name: "Starter" }, // 50 min/mo - no additional
  { maxAnnualMinutes: 3000, costPerMinute: 0.12, name: "Creator" }, // 250 min/mo, ~$0.12/min additional
  { maxAnnualMinutes: 13200, costPerMinute: 0.11, name: "Pro" }, // 1,100 min/mo, ~$0.11/min additional
  { maxAnnualMinutes: 43200, costPerMinute: 0.10, name: "Scale" }, // 3,600 min/mo, ~$0.10/min additional
  { maxAnnualMinutes: 165000, costPerMinute: 0.096, name: "Business" }, // 13,750 min/mo, $0.096/min additional
  { maxAnnualMinutes: Infinity, costPerMinute: 0.096, name: "Enterprise" }, // Use Business rate for anything above
];

// LLM pricing for Gemini 2.0 Flash based on knowledge base size
const LLM_PRICING = {
  none: 0.001,
  small: 0.005,
  medium: 0.010,
  large: 0.012,
};

const TELEPHONY_COST_PER_MINUTE = 0.016;
const FREE_PHONE_LINES = 2;
const FREE_CONCURRENCY = 15;
const CONCURRENCY_COST_PER_LINE = 10;

export default function Home() {
  const [totalMinutes, setTotalMinutes] = useState<number>(10000);
  const [minutesInput, setMinutesInput] = useState<string>('10000');
  const [phoneNumbers, setPhoneNumbers] = useState<number>(2);
  const [concurrency, setConcurrency] = useState<number>(15);
  const [knowledgeBase, setKnowledgeBase] = useState<'none' | 'small' | 'medium' | 'large'>('none');

  const calculateCosts = () => {
    // Find orchestration tier based on total bundle minutes
    const tier = ORCHESTRATION_TIERS.find(t => totalMinutes <= t.maxAnnualMinutes) || ORCHESTRATION_TIERS[ORCHESTRATION_TIERS.length - 1];
    const orchestrationCostPerMinute = tier.costPerMinute;
    const totalOrchestrationCost = totalMinutes * orchestrationCostPerMinute;

    // LLM cost per minute
    const llmCostPerMinute = LLM_PRICING[knowledgeBase];
    const totalLlmCost = totalMinutes * llmCostPerMinute;

    // Telephony cost
    const totalTelephonyCost = totalMinutes * TELEPHONY_COST_PER_MINUTE;

    // Phone number cost (assuming $0 for included lines, need clarification)
    const additionalPhoneLines = Math.max(0, phoneNumbers - FREE_PHONE_LINES);
    const phoneLineCost = 0; // Need pricing info

    // Concurrency cost - this is annual since it's for the plan duration
    const additionalConcurrency = Math.max(0, concurrency - FREE_CONCURRENCY);
    const annualConcurrencyCost = additionalConcurrency * CONCURRENCY_COST_PER_LINE * 12;

    const totalBundleCost =
      totalOrchestrationCost +
      totalLlmCost +
      totalTelephonyCost +
      phoneLineCost +
      annualConcurrencyCost;

    return {
      orchestration: totalOrchestrationCost,
      orchestrationRate: orchestrationCostPerMinute,
      llm: totalLlmCost,
      llmRate: llmCostPerMinute,
      telephony: totalTelephonyCost,
      phoneLines: phoneLineCost,
      concurrency: annualConcurrencyCost,
      total: totalBundleCost,
      costPerMinute: totalBundleCost / totalMinutes,
    };
  };

  const costs = calculateCosts();

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-2 text-gray-800">
          Lux Voice Minutes Calculator
        </h1>
        <p className="text-center text-gray-600 mb-8">Purchase minute bundles for your AI voice service</p>

        <div className="bg-white rounded-lg shadow-xl p-8 mb-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Bundle Configuration</h2>

          <div className="space-y-6">
            {/* Total Minutes Bundle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Minutes to Purchase
              </label>
              <input
                type="text"
                inputMode="numeric"
                value={minutesInput}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, '');
                  setMinutesInput(value);
                  setTotalMinutes(value === '' ? 0 : Number(value));
                }}
                onFocus={(e) => e.target.select()}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="0"
              />
              <p className="text-sm text-gray-500 mt-1">One-time minute bundle purchase</p>
            </div>

            {/* Knowledge Base Size */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Knowledge Base Size
              </label>
              <select
                value={knowledgeBase}
                onChange={(e) => setKnowledgeBase(e.target.value as any)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              >
                <option value="none">No Knowledge Base</option>
                <option value="small">Small Knowledge Base</option>
                <option value="medium">Medium Knowledge Base</option>
                <option value="large">Large Knowledge Base</option>
              </select>
              <p className="text-sm text-gray-500 mt-1">LLM rate: ${costs.llmRate.toFixed(4)}/min</p>
            </div>

            {/* Phone Numbers */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Number of Phone Lines
              </label>
              <input
                type="number"
                value={phoneNumbers}
                onChange={(e) => setPhoneNumbers(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">{FREE_PHONE_LINES} lines included</p>
            </div>

            {/* Concurrency */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Concurrency
              </label>
              <input
                type="number"
                value={concurrency}
                onChange={(e) => setConcurrency(Number(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                min="0"
              />
              <p className="text-sm text-gray-500 mt-1">{FREE_CONCURRENCY} concurrent lines free, ${CONCURRENCY_COST_PER_LINE}/line after</p>
            </div>
          </div>
        </div>

        {/* Cost Breakdown */}
        <div className="bg-white rounded-lg shadow-xl p-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Bundle Cost Breakdown</h2>

          <div className="space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-700">Orchestration</p>
                <p className="text-sm text-gray-500">${costs.orchestrationRate.toFixed(4)}/min × {totalMinutes.toLocaleString()} minutes</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">${costs.orchestration.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-700">LLM (Gemini 2.0 Flash)</p>
                <p className="text-sm text-gray-500">${costs.llmRate.toFixed(4)}/min × {totalMinutes.toLocaleString()} minutes</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">${costs.llm.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <div>
                <p className="font-medium text-gray-700">Telephony (Twilio)</p>
                <p className="text-sm text-gray-500">${TELEPHONY_COST_PER_MINUTE.toFixed(4)}/min × {totalMinutes.toLocaleString()} minutes</p>
              </div>
              <p className="text-lg font-semibold text-gray-800">${costs.telephony.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            {costs.concurrency > 0 && (
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <div>
                  <p className="font-medium text-gray-700">Additional Concurrency (Annual)</p>
                  <p className="text-sm text-gray-500">{Math.max(0, concurrency - FREE_CONCURRENCY).toLocaleString()} lines × ${CONCURRENCY_COST_PER_LINE.toLocaleString()}/mo × 12 months</p>
                </div>
                <p className="text-lg font-semibold text-gray-800">${costs.concurrency.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
              </div>
            )}

            <div className="flex justify-between items-center pt-4 border-t-2 border-gray-300">
              <p className="text-xl font-bold text-gray-800">Total Bundle Cost</p>
              <p className="text-2xl font-bold text-indigo-600">${costs.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>

            <div className="flex justify-between items-center text-gray-600">
              <p className="text-lg">Effective Cost per Minute</p>
              <p className="text-xl font-semibold">${costs.costPerMinute.toFixed(4)}</p>
            </div>

            <div className="bg-indigo-50 rounded-lg p-4 mt-4">
              <p className="text-sm text-indigo-800">
                <span className="font-semibold">Bundle Model:</span> You purchase {totalMinutes.toLocaleString()} minutes upfront.
                We acquire an annual ElevenLabs plan to fulfill your bundle, ensuring you never over-commit.
              </p>
            </div>
          </div>
        </div>

        {/* Revenue & Margin Analysis */}
        <div className="bg-white rounded-lg shadow-xl p-8 mt-8">
          <h2 className="text-2xl font-semibold mb-6 text-gray-800">Revenue & Margin Scenarios</h2>

          <div className="space-y-6">
            {/* 20% Markup */}
            <div className="bg-green-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-green-800 mb-4">20% Markup</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Customer Price (Revenue)</span>
                  <span className="font-semibold text-gray-900">${(costs.total * 1.20).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Your Profit</span>
                  <span className="font-semibold text-green-600">${(costs.total * 0.20).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-green-200">
                  <span className="text-gray-700">Customer Cost per Minute</span>
                  <span className="font-semibold text-gray-900">${((costs.total * 1.20) / totalMinutes).toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* 30% Markup */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-blue-800 mb-4">30% Markup</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Customer Price (Revenue)</span>
                  <span className="font-semibold text-gray-900">${(costs.total * 1.30).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Your Profit</span>
                  <span className="font-semibold text-blue-600">${(costs.total * 0.30).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-blue-200">
                  <span className="text-gray-700">Customer Cost per Minute</span>
                  <span className="font-semibold text-gray-900">${((costs.total * 1.30) / totalMinutes).toFixed(4)}</span>
                </div>
              </div>
            </div>

            {/* 40% Markup */}
            <div className="bg-purple-50 rounded-lg p-6">
              <h3 className="text-xl font-semibold text-purple-800 mb-4">40% Markup</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Customer Price (Revenue)</span>
                  <span className="font-semibold text-gray-900">${(costs.total * 1.40).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-700">Your Profit</span>
                  <span className="font-semibold text-purple-600">${(costs.total * 0.40).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between items-center pt-2 border-t border-purple-200">
                  <span className="text-gray-700">Customer Cost per Minute</span>
                  <span className="font-semibold text-gray-900">${((costs.total * 1.40) / totalMinutes).toFixed(4)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
