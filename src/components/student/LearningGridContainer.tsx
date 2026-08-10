import React from "react";
import Link from "next/link";
import type { GradeActionCard } from "@/types/student";

interface ExtendedCard extends GradeActionCard {
  isCompleted?: boolean;
  activityType?: string;
}

interface LearningGridContainerProps {
  cards: ExtendedCard[];
  onCardClick?: (card: ExtendedCard) => void;
}

export default function LearningGridContainer({ cards, onCardClick }: LearningGridContainerProps) {
  return (
    <section className="learning-grid-container">
      {cards.map((card) => {
        const isExternal = card.targetUrl?.startsWith("http");
        const Wrapper = isExternal ? "a" : Link;
        const props = isExternal 
          ? { href: card.targetUrl, target: "_blank", rel: "noopener noreferrer" } 
          : { href: card.enabled ? card.targetUrl : "#" };

        const handleClick = (e: React.MouseEvent) => {
          if (onCardClick) {
            onCardClick(card);
          }
        };

        return (
          <Wrapper
            key={card.id}
            {...props as any}
            onClick={handleClick}
            className={`action-card card-color-${card.buttonColor} ${card.isCompleted ? "completed-activity" : ""}`}
            style={{
              textDecoration: "none",
              opacity: card.enabled ? 1 : 0.5,
              pointerEvents: card.enabled ? "auto" : "none",
              position: "relative",
            }}
            aria-disabled={!card.enabled}
          >
            <div className="card-header-group">
              <span className="card-icon-placeholder">{card.isCompleted ? "✅" : card.icon}</span>
              <div className="card-titles">
                <h3 className="card-main-title">
                  {card.title}
                  {card.isCompleted && (
                    <span style={{ marginLeft: "8px", fontSize: "0.85rem", color: "var(--color-success)", fontWeight: "bold" }}>
                      ✓ Completed
                    </span>
                  )}
                </h3>
                <span className="card-sub-title">{card.isCompleted ? "Activity Done (+Rewards Claimed)" : card.subtitle}</span>
              </div>
            </div>
            <p className="card-description">{card.description}</p>
            <div className="card-footer-action">
              <button className="card-circle-arrow-btn">{card.isCompleted ? "✓" : "→"}</button>
            </div>
          </Wrapper>
        );
      })}
    </section>
  );
}
