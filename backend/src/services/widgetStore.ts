import { prisma } from "../lib/prisma";
import { Prisma } from "@prisma/client";
import { WidgetConfig } from "../../../shared/types";

export class WidgetStore {
  async create(config: { placeId: string; businessName?: string; title?: string; settings?: any }): Promise<WidgetConfig> {
    const defaultSettings = {
      layout: "grid",
      theme: "light",
      primaryColor: "#4285F4",
      showHeader: true,
      showRating: true,
      showReviews: true,
      showAiSummary: true,
      showDate: true,
      showAuthorPhoto: true,
      cardStyle: "shadow",
      borderRadius: 12,
      fontSize: 14,
      minRating: 4,
      sortBy: "rating"
    };

    const widget = await prisma.widget.create({
      data: {
        placeId: config.placeId,
        businessName: config.businessName ?? "Business",
        title: config.title ?? "Google Reviews",
        settings: (config.settings ?? defaultSettings) as any,
      },
    });

    return {
      id: widget.id,
      placeId: widget.placeId,
      businessName: widget.businessName ?? "Business",
      title: widget.title ?? "Google Reviews",
      settings: widget.settings as any,
    };
  }

  async get(id: string): Promise<WidgetConfig | null> {
    const widget = await prisma.widget.findUnique({
      where: { id },
    });

    if (!widget) return null;

    return {
      id: widget.id,
      placeId: widget.placeId,
      businessName: widget.businessName ?? "Business",
      title: widget.title ?? "Google Reviews",
      settings: widget.settings as any,
    };
  }

  async update(id: string, updates: Partial<WidgetConfig>): Promise<WidgetConfig> {
    const data: Prisma.WidgetUpdateInput = {};
    if (updates.title !== undefined) data.title = updates.title;
    if (updates.businessName !== undefined) data.businessName = updates.businessName;
    if (updates.settings !== undefined) data.settings = updates.settings as any;

    const widget = await prisma.widget.update({
      where: { id },
      data,
    });

    return {
      id: widget.id,
      placeId: widget.placeId,
      businessName: widget.businessName ?? "Business",
      title: widget.title ?? "Google Reviews",
      settings: widget.settings as any,
    };
  }

  async list(): Promise<WidgetConfig[]> {
    const widgets = await prisma.widget.findMany({
      orderBy: { createdAt: "desc" },
    });

    return widgets.map(widget => ({
      id: widget.id,
      placeId: widget.placeId,
      businessName: widget.businessName ?? "Business",
      title: widget.title ?? "Google Reviews",
      settings: widget.settings as any,
    }));
  }
}
