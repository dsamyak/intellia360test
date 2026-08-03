import React from "react";
import Link from "next/link";
import type { GradeActionCard } from "@/types/student";

interface LearningGridContainerProps {
  cards: GradeActionCard[];
}

export default function LearningGridContainer({ cards }: LearningGridContainerProps) {
  return (
    <section className="learning-grid-container">
      {cards.map((card) => {
        const isExternal = card.targetUrl?.startsWith("http");
        const Wrapper = isExternal ? "a" : Link;
        const props = isExternal 
          ? { href: card.targetUrl, target: "_blank", rel: "noopener noreferrer" } 
          : { href: card.enabled ? card.targetUrl : "#" };

        return (
          <Wrapper
            key={card.id}
            {...props as any}
            className={`action-card card-color-${card.buttonColor}`}
            style={{
              textDecoration: "none",
              opacity: card.enabled ? 1 : 0.5,
              pointerEvents: card.enabled ? "auto" : "none",
            }}
            aria-disabled={!card.enabled}
          >
            <div className="card-header-group">
              <span className="card-icon-placeholder">{card.icon}</span>
              <div className="card-titles">
                <h3 className="card-main-title">{card.title}</h3>
                <span className="card-sub-title">{card.subtitle}</span>
              </div>
            </div>
            <p className="card-description">{card.description}</p>
            <div className="card-footer-action">
              <button className="card-circle-arrow-btn">→</button>
            </div>
          </Wrapper>
        );
      })}
    </section>
  );
}
