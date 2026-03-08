/**
 * ConversationCards — generates conversation starter prompts for parents
 * based on what their kids are watching and the CSM descriptor data.
 *
 * For each child, looks at their top most-watched titles that have descriptor
 * data, picks the most relevant descriptor category (highest numericLevel),
 * and generates a template-based conversation prompt.
 */

import React, { useState } from 'react';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ChildInsight {
  child: { id: string; name: string; birth_date: string };
  age: number;
  totalEntries: number;
  uniqueTitles: number;
  matched: number;
  aboveAge: { title: string; ageMin: number; stars: number; episodes: number; ageExplanation: string; parentSummary: string; descriptors: { category: string; level: string; numericLevel: number }[] }[];
  ageBreakdown: { ageMin: number; uniqueTitles: number; episodes: number }[];
  highQuality: number;
  familyFriendly: number;
  topDescriptors: { category: string; count: number }[];
  descriptorAverages: { category: string; avgLevel: number; titleCount: number }[];
  positiveContentSummary: { category: string; count: number }[];
  titleWatchCounts: { title: string; displayTitle: string; episodes: number; ageMin: number | null; stars: number; isFamilyFriendly: boolean }[];
}

interface Props {
  insights: ChildInsight[];
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const CHILD_COLORS = ['#2dd4bf', '#60a5fa', '#f472b6', '#a78bfa', '#fbbf24', '#34d399', '#f87171', '#818cf8'];

const INITIAL_VISIBLE = 4;

// Category-based prompt templates
const PROMPT_TEMPLATES: Record<string, (title: string) => string> = {
  violence: (t) =>
    `Have you noticed any fighting or conflict in ${t}? What did you think about how they resolved it?`,
  language: (t) =>
    `${t} has some strong language. Have you heard words like that at school?`,
  'sex/romance': (t) =>
    `There are some romantic scenes in ${t}. Do you have any questions about relationships?`,
  sex: (t) =>
    `There are some romantic scenes in ${t}. Do you have any questions about relationships?`,
  romance: (t) =>
    `There are some romantic scenes in ${t}. Do you have any questions about relationships?`,
  'drinking/drugs': (t) =>
    `Some characters in ${t} use substances. What do you think about that?`,
  drinking: (t) =>
    `Some characters in ${t} use substances. What do you think about that?`,
  drugs: (t) =>
    `Some characters in ${t} use substances. What do you think about that?`,
  'positive role models': (t) =>
    `Who's your favorite character in ${t}? What makes them a good role model?`,
  'positive messages': (t) =>
    `What important lessons have you picked up from ${t}?`,
};

const DEFAULT_PROMPT = (t: string) =>
  `What do you enjoy most about ${t}? What would you tell a friend about it?`;

// Category display config
const CATEGORY_CONFIG: Record<string, { label: string; borderColor: string; tagBg: string; tagColor: string }> = {
  violence: { label: 'Violence', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  language: { label: 'Language', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  'sex/romance': { label: 'Sex/Romance', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  sex: { label: 'Sex/Romance', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  romance: { label: 'Romance', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  'drinking/drugs': { label: 'Drinking/Drugs', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  drinking: { label: 'Drinking/Drugs', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  drugs: { label: 'Drugs', borderColor: '#f59e0b', tagBg: '#78350f30', tagColor: '#fbbf24' },
  'positive role models': { label: 'Positive Role Models', borderColor: '#10b981', tagBg: '#064e3b30', tagColor: '#34d399' },
  'positive messages': { label: 'Positive Messages', borderColor: '#10b981', tagBg: '#064e3b30', tagColor: '#34d399' },
};

const DEFAULT_CATEGORY_CONFIG = { label: 'General', borderColor: '#60a5fa', tagBg: '#1e3a5f30', tagColor: '#60a5fa' };

// ---------------------------------------------------------------------------
// Card data generation
// ---------------------------------------------------------------------------

interface ConversationCard {
  childName: string;
  childColor: string;
  title: string;
  question: string;
  category: string;
  categoryConfig: { label: string; borderColor: string; tagBg: string; tagColor: string };
}

function buildCards(insights: ChildInsight[]): ConversationCard[] {
  const cards: ConversationCard[] = [];

  insights.forEach((insight, childIdx) => {
    const color = CHILD_COLORS[childIdx % CHILD_COLORS.length];

    // Get aboveAge items that have descriptors, sorted by episodes desc
    const titlesWithDescriptors = insight.aboveAge
      .filter((item) => item.descriptors && item.descriptors.length > 0)
      .sort((a, b) => b.episodes - a.episodes)
      .slice(0, 3);

    for (const item of titlesWithDescriptors) {
      // Find the most relevant descriptor (highest numericLevel)
      const topDescriptor = item.descriptors.reduce(
        (best, d) => (d.numericLevel > best.numericLevel ? d : best),
        item.descriptors[0]
      );

      const categoryKey = topDescriptor.category.toLowerCase();
      const promptFn = PROMPT_TEMPLATES[categoryKey] || DEFAULT_PROMPT;
      const config = CATEGORY_CONFIG[categoryKey] || DEFAULT_CATEGORY_CONFIG;

      cards.push({
        childName: insight.child.name,
        childColor: color,
        title: item.title,
        question: promptFn(item.title),
        category: categoryKey,
        categoryConfig: config,
      });
    }
  });

  return cards;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

const ConversationCards: React.FC<Props> = ({ insights }) => {
  const [expanded, setExpanded] = useState(false);

  const allCards = buildCards(insights);
  const visibleCards = expanded ? allCards : allCards.slice(0, INITIAL_VISIBLE);
  const hasMore = allCards.length > INITIAL_VISIBLE;

  if (allCards.length === 0) {
    return (
      <div
        style={{
          background: 'var(--chrome-surface)',
          border: '1px solid var(--chrome-border)',
          borderRadius: 12,
          padding: '32px 24px',
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>&#x1F4AC;</div>
        <p style={{ color: 'var(--chrome-text)', fontSize: 15, fontWeight: 600, margin: '0 0 4px' }}>
          No conversation starters yet
        </p>
        <p style={{ color: 'var(--chrome-text-secondary)', fontSize: 13, margin: 0 }}>
          Once your kids watch titles with content ratings, we will suggest conversation topics here.
        </p>
      </div>
    );
  }

  // Slight rotation offsets for the stacked card feel
  const rotations = [0, -0.4, 0.3, -0.2, 0.5, -0.3, 0.4, -0.5];

  return (
    <div style={{ marginBottom: 4 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>&#x1F4AC;</span>
        <h3 style={{ color: 'var(--chrome-text)', fontSize: 15, fontWeight: 600, margin: 0 }}>
          Conversation Starters
        </h3>
        <span style={{ color: 'var(--chrome-text-secondary)', fontSize: 12, marginLeft: 4 }}>
          Talk about what they are watching
        </span>
      </div>

      {/* Card stack */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {visibleCards.map((card, idx) => (
          <div
            key={`${card.childName}-${card.title}-${idx}`}
            style={{
              background: 'var(--chrome-surface)',
              border: '1px solid var(--chrome-border)',
              borderLeft: `3px solid ${card.categoryConfig.borderColor}`,
              borderRadius: 10,
              padding: '14px 16px',
              transform: `rotate(${rotations[idx % rotations.length]}deg)`,
              transition: 'transform 0.2s, border-color 0.15s',
              cursor: 'default',
              marginLeft: (idx % 3) * 4,
            }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = 'rotate(0deg) scale(1.01)';
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLDivElement).style.transform = `rotate(${rotations[idx % rotations.length]}deg)`;
            }}
          >
            {/* Top row: child name + category tag */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: card.childColor,
                  background: card.childColor + '18',
                  padding: '2px 8px',
                  borderRadius: 6,
                  textTransform: 'uppercase',
                  letterSpacing: 0.5,
                }}
              >
                {card.childName}
              </span>
              <span
                style={{
                  fontSize: 10,
                  fontWeight: 600,
                  color: card.categoryConfig.tagColor,
                  background: card.categoryConfig.tagBg,
                  padding: '2px 8px',
                  borderRadius: 4,
                }}
              >
                {card.categoryConfig.label}
              </span>
            </div>

            {/* Title */}
            <p
              style={{
                color: 'var(--chrome-text)',
                fontSize: 12,
                fontWeight: 600,
                margin: '0 0 6px',
                opacity: 0.7,
              }}
            >
              About: {card.title}
            </p>

            {/* Conversation question */}
            <p
              style={{
                color: 'var(--chrome-text)',
                fontSize: 13,
                lineHeight: 1.5,
                margin: 0,
                fontStyle: 'italic',
              }}
            >
              &ldquo;{card.question}&rdquo;
            </p>
          </div>
        ))}
      </div>

      {/* More ideas button */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          style={{
            display: 'block',
            margin: '12px auto 0',
            padding: '6px 20px',
            background: 'transparent',
            border: '1px solid var(--chrome-border)',
            borderRadius: 8,
            color: 'var(--chrome-accent)',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'background 0.15s, border-color 0.15s',
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'var(--chrome-hover)';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--chrome-accent)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.background = 'transparent';
            (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--chrome-border)';
          }}
        >
          {expanded ? 'Show fewer' : `More ideas (${allCards.length - INITIAL_VISIBLE} more)`}
        </button>
      )}
    </div>
  );
};

export default ConversationCards;
