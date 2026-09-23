/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Vector2D, ActionTimeline } from '../types/game';
import {
  TemporalEvent,
  TemporalEventType,
  ActorType,
  EchoRoleAnalysis,
} from '../types/innovation';

export class TemporalMemory {
  private events: TemporalEvent[] = [];
  private eventIdCounter = 1;

  public clearLevelHistory() {
    this.events = [];
    this.eventIdCounter = 1;
  }

  public recordEvent(
    params: {
      loopNumber: number;
      timestamp: number;
      eventType: TemporalEventType;
      position: Vector2D;
      objectId: string;
      actorType: ActorType;
      actorId: string;
      metadata?: Record<string, unknown>;
    }
  ): TemporalEvent {
    const event: TemporalEvent = {
      id: `evt-${this.eventIdCounter++}-${Date.now().toString(36)}`,
      ...params,
    };
    this.events.push(event);
    return event;
  }

  public getEvents(): TemporalEvent[] {
    return this.events;
  }

  public getEventsForObject(objectId: string): TemporalEvent[] {
    return this.events.filter((e) => e.objectId === objectId);
  }

  public getEventsByLoop(loopNumber: number): TemporalEvent[] {
    return this.events.filter((e) => e.loopNumber === loopNumber);
  }

  public getDistinctLoopsForObject(objectId: string): number[] {
    const loops = new Set<number>();
    for (const evt of this.events) {
      if (evt.objectId === objectId) {
        loops.add(evt.loopNumber);
      }
    }
    return Array.from(loops).sort((a, b) => a - b);
  }

  public wasActivatedByEchoInPreviousLoop(objectId: string, currentLoopNumber: number): boolean {
    return this.events.some(
      (e) =>
        e.objectId === objectId &&
        e.actorType === 'ECHO' &&
        e.loopNumber < currentLoopNumber
    );
  }

  public getInteractionCountAcrossLoops(objectId: string): number {
    return this.getDistinctLoopsForObject(objectId).length;
  }

  public hasEchoReachedLocation(targetPos: Vector2D, radius: number): boolean {
    return this.events.some((e) => {
      if (e.actorType !== 'ECHO') return false;
      const dx = e.position.x - targetPos.x;
      const dy = e.position.y - targetPos.y;
      return Math.hypot(dx, dy) <= radius;
    });
  }

  public analyzeEchoRole(timeline: ActionTimeline): EchoRoleAnalysis {
    const frames = timeline.frames;
    if (!frames || frames.length === 0) {
      return {
        role: 'SCOUT',
        description: 'Initial reconnaissance unit',
        badge: 'SCOUT',
        activationsCount: 0,
        stationaryRatio: 0,
        distanceTraveled: 0,
      };
    }

    let totalDist = 0;
    let stationaryFrames = 0;
    for (let i = 1; i < frames.length; i++) {
      const d = Math.hypot(frames[i].x - frames[i - 1].x, frames[i].y - frames[i - 1].y);
      totalDist += d;
      if (d < 0.25) {
        stationaryFrames++;
      }
    }

    const stationaryRatio = stationaryFrames / frames.length;
    const loopEvents = this.events.filter((e) => e.loopNumber === timeline.loopIndex);
    const activations = loopEvents.filter(
      (e) =>
        e.eventType === 'plate_press' ||
        e.eventType === 'switch_toggle' ||
        e.eventType === 'sensor_trip' ||
        e.eventType === 'terminal_scan'
    ).length;

    if (activations >= 2) {
      return {
        role: 'ACTIVATOR',
        description: 'Multi-node switch and relay operator',
        badge: 'ACTIVATOR',
        activationsCount: activations,
        stationaryRatio,
        distanceTraveled: Math.round(totalDist),
      };
    }

    if (stationaryRatio > 0.45 && activations > 0) {
      return {
        role: 'GUARDIAN',
        description: 'Sustains compression on critical power conduit',
        badge: 'GUARDIAN',
        activationsCount: activations,
        stationaryRatio,
        distanceTraveled: Math.round(totalDist),
      };
    }

    if (loopEvents.some((e) => e.eventType === 'sync_achieved')) {
      return {
        role: 'SYNC_PARTNER',
        description: 'Temporal synchronization partner',
        badge: 'SYNC',
        activationsCount: activations,
        stationaryRatio,
        distanceTraveled: Math.round(totalDist),
      };
    }

    if (totalDist > 650) {
      return {
        role: 'SCOUT',
        description: 'High-velocity sector surveyor',
        badge: 'SCOUT',
        activationsCount: activations,
        stationaryRatio,
        distanceTraveled: Math.round(totalDist),
      };
    }

    return {
      role: 'CHRONO_OPERATIVE',
      description: 'Standard temporal anchor',
      badge: 'ANCHOR',
      activationsCount: activations,
      stationaryRatio,
      distanceTraveled: Math.round(totalDist),
    };
  }
}
