"use client";

import { useEffect, useRef, useState } from "react";

import {
    AdminHeroData,
    KpiStat,
    HealthCheckItem,
    emptyHeroData,
    emptyKpiStats,
    emptyPlatformHealthItems,
    fetchHeroData,
    fetchKpiStats,
    fetchPlatformHealth,
} from "@/data/admin/dashboard";

/* ============================================================
   ADMIN DASHBOARD DATA HOOK

   Frontend-only mode:
   - Starts with zero/empty data
   - No API polling
   - No hardcoded numbers
   - Ready for backend integration later
============================================================ */

export function useAdminDashboardData() {
    const [heroData, setHeroData] =
        useState<AdminHeroData>(emptyHeroData);

    const [kpiStats, setKpiStats] =
        useState<KpiStat[]>(emptyKpiStats);

    const [platformHealth, setPlatformHealth] =
        useState<HealthCheckItem[]>(
            emptyPlatformHealthItems
        );

    const [isLoading, setIsLoading] =
        useState(true);

    const [error, setError] =
        useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;

        async function loadDashboardData() {
            try {
                setIsLoading(true);

                const [
                    hero,
                    kpis,
                    health,
                ] = await Promise.all([
                    fetchHeroData(),
                    fetchKpiStats(),
                    fetchPlatformHealth(),
                ]);

                if (cancelled) return;

                setHeroData(hero);
                setKpiStats(kpis);
                setPlatformHealth(health);

                setError(null);
            } catch (err) {
                if (cancelled) return;

                setError(
                    err instanceof Error
                        ? err.message
                        : "Failed to load dashboard data"
                );

                // Keep dashboard in zero state if something fails.
                setHeroData(emptyHeroData);
                setKpiStats(emptyKpiStats);
                setPlatformHealth(
                    emptyPlatformHealthItems
                );
            } finally {
                if (!cancelled) {
                    setIsLoading(false);
                }
            }
        }

        loadDashboardData();

        return () => {
            cancelled = true;
        };
    }, []);

    return {
        heroData,
        kpiStats,
        platformHealth,
        isLoading,
        error,
    };
}

/* ============================================================
   COUNT UP ANIMATION

   Animates numbers from 0 → actual value.

   Currently dashboard values are 0, so nothing fake is shown.
   When backend data is connected later, the animation will
   automatically work with the real value.
============================================================ */

export function useCountUp(
    target: number,
    durationMs = 900
) {
    const [value, setValue] = useState(0);

    const frameRef =
        useRef<number | undefined>(undefined);

    useEffect(() => {
        const safeTarget = Number(target) || 0;

        // Cancel previous animation.
        if (frameRef.current !== undefined) {
            cancelAnimationFrame(frameRef.current);
        }

        // If target is zero, immediately keep zero.
        if (safeTarget === 0) {
            setValue(0);
            return;
        }

        const start = performance.now();

        function tick(now: number) {
            const progress = Math.min(
                (now - start) / durationMs,
                1
            );

            // Ease-out cubic
            const eased =
                1 - Math.pow(1 - progress, 3);

            setValue(
                Math.round(safeTarget * eased)
            );

            if (progress < 1) {
                frameRef.current =
                    requestAnimationFrame(tick);
            }
        }

        frameRef.current =
            requestAnimationFrame(tick);

        return () => {
            if (frameRef.current !== undefined) {
                cancelAnimationFrame(
                    frameRef.current
                );
            }
        };
    }, [target, durationMs]);

    return value;
}