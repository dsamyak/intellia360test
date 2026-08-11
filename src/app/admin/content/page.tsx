"use client";

import React, { useMemo, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import {
  FileText,
  Video,
  Sparkles,
  Plus,
} from "@/components/admin/icons";

type ContentCategory =
  | "edunotes"
  | "visual-models"
  | "videos"
  | "ai-prompts";

type ContentItem = {
  id: string;
  title: string;
  description: string;
  category: ContentCategory;
  createdAt: string;
};

type CategoryConfig = {
  id: ContentCategory;
  title: string;
  unit: string;
  bg: string;
  border: string;
  iconColor: string;
  icon: React.ReactNode;
  description: string;
};

const categoryConfig: CategoryConfig[] = [
  {
    id: "edunotes",
    title: "EduNotes & Digital Worksheets",
    unit: "Files",
    bg: "bg-purple-50",
    border: "border-purple-200",
    iconColor: "text-purple-600",
    icon: <FileText className="h-6 w-6" />,
    description:
      "Visual bite-sized notes, formula cards, and downloadable PDF worksheets.",
  },
  {
    id: "visual-models",
    title: "3D Visual Math Models",
    unit: "Modules",
    bg: "bg-blue-50",
    border: "border-blue-200",
    iconColor: "text-blue-600",
    icon: <span className="text-xl">🧊</span>,
    description:
      "Interactive place value blocks, 3D base-10 cubes, and number builders.",
  },
  {
    id: "videos",
    title: "Video Lessons & Animations",
    unit: "Videos",
    bg: "bg-rose-50",
    border: "border-rose-200",
    iconColor: "text-rose-600",
    icon: <Video className="h-6 w-6" />,
    description:
      "Animated math stories, real-world concept explanations, and guided walkthroughs.",
  },
  {
    id: "ai-prompts",
    title: "AI Tutor Prompt Configurations",
    unit: "Configs",
    bg: "bg-amber-50",
    border: "border-amber-200",
    iconColor: "text-amber-600",
    icon: <Sparkles className="h-6 w-6" />,
    description:
      "Contextual system prompts, quick question templates, and chatbot hints.",
  },
];

export default function AdminContentPage() {
  /* =========================================
     Frontend Content State
     Starts EMPTY intentionally
  ========================================= */

  const [contentItems, setContentItems] = useState<ContentItem[]>([]);

  const [showModal, setShowModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "edunotes" as ContentCategory,
  });

  /* =========================================
     Dynamic Statistics
  ========================================= */

  const contentStats = useMemo(() => {
    const totalResources = contentItems.length;

    const videoResources = contentItems.filter(
      (item) => item.category === "videos"
    ).length;

    const interactiveAssets = contentItems.filter(
      (item) => item.category === "visual-models"
    ).length;

    const categoriesInUse = new Set(
      contentItems.map((item) => item.category)
    ).size;

    return {
      totalResources,
      videoResources,
      interactiveAssets,
      categoriesInUse,
    };
  }, [contentItems]);

  /* =========================================
     Category Count
  ========================================= */

  const getCategoryCount = (category: ContentCategory) => {
    return contentItems.filter(
      (item) => item.category === category
    ).length;
  };

  /* =========================================
     Add Resource
  ========================================= */

  const handleAddResource = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      return;
    }

    const newItem: ContentItem = {
      id: `${formData.category}-${Date.now()}`,
      title: formData.title.trim(),
      description:
        formData.description.trim() ||
        "New Intellia360 learning resource.",
      category: formData.category,
      createdAt: new Date().toISOString(),
    };

    setContentItems((previousItems) => [
      ...previousItems,
      newItem,
    ]);

    setFormData({
      title: "",
      description: "",
      category: "edunotes",
    });

    setShowModal(false);
  };

  /* =========================================
     Delete Resource
  ========================================= */

  const handleDeleteResource = (id: string) => {
    setContentItems((previousItems) =>
      previousItems.filter((item) => item.id !== id)
    );
  };

  return (
    <AdminLayout>
      <div className="admin-content-page">

        {/* =====================================
            Header
        ===================================== */}

        <div className="admin-content-header">
          <div>
            <div className="admin-breadcrumb">
              Admin / Content Library
            </div>

            <h1 className="admin-page-title">
              Content Library & Resources
            </h1>

            <p className="admin-page-subtitle">
              Manage EduNotes, interactive assets, video
              resources and AI Tutor configurations.
            </p>
          </div>

          <button
            type="button"
            className="admin-primary-button"
            onClick={() => setShowModal(true)}
          >
            <Plus className="h-4 w-4" />
            Upload Resource
          </button>
        </div>

        {/* =====================================
            Dynamic Statistics
        ===================================== */}

        <div className="content-stats-grid">

          {/* Total Resources */}
          <div className="content-stat-card">
            <div className="content-stat-icon orange">
              <FileText className="h-6 w-6" />
            </div>

            <div>
              <span>Total Resources</span>

              <strong>
                {contentStats.totalResources}
              </strong>

              <small>
                Added to library
              </small>
            </div>
          </div>

          {/* Categories */}
          <div className="content-stat-card">
            <div className="content-stat-icon purple">
              <Sparkles className="h-6 w-6" />
            </div>

            <div>
              <span>Active Categories</span>

              <strong>
                {contentStats.categoriesInUse}
              </strong>

              <small>
                With uploaded resources
              </small>
            </div>
          </div>

          {/* Videos */}
          <div className="content-stat-card">
            <div className="content-stat-icon rose">
              <Video className="h-6 w-6" />
            </div>

            <div>
              <span>Video Resources</span>

              <strong>
                {contentStats.videoResources}
              </strong>

              <small>
                Lessons & animations
              </small>
            </div>
          </div>

          {/* Interactive */}
          <div className="content-stat-card">
            <div className="content-stat-icon blue">
              <span className="text-lg">🧊</span>
            </div>

            <div>
              <span>Interactive Assets</span>

              <strong>
                {contentStats.interactiveAssets}
              </strong>

              <small>
                Visual learning modules
              </small>
            </div>
          </div>
        </div>

        {/* =====================================
            Empty State
        ===================================== */}

        {contentItems.length === 0 && (
          <div className="content-empty-state">
            <div className="content-empty-icon">
              <FileText className="h-7 w-7" />
            </div>

            <h2>No resources added yet</h2>

            <p>
              Upload or create your first resource to
              start building the Intellia360 content library.
            </p>

            <button
              type="button"
              className="admin-primary-button"
              onClick={() => setShowModal(true)}
            >
              <Plus className="h-4 w-4" />
              Add First Resource
            </button>
          </div>
        )}

        {/* =====================================
            Category Cards
        ===================================== */}

        <div className="content-category-grid">
          {categoryConfig.map((category) => {
            const count = getCategoryCount(category.id);

            return (
              <div
                key={category.id}
                className={`content-category-card ${category.border}`}
              >
                <div className="content-category-top">
                  <div
                    className={`content-category-icon ${category.bg} ${category.iconColor}`}
                  >
                    {category.icon}
                  </div>

                  <span className="content-count-badge">
                    {count.toLocaleString()} {category.unit}
                  </span>
                </div>

                <div className="content-category-body">
                  <h3>{category.title}</h3>

                  <p>{category.description}</p>
                </div>

                <div className="content-category-actions">
                  <button
                    type="button"
                    className="admin-btn-secondary content-manage-button"
                    onClick={() => {
                      setFormData((previous) => ({
                        ...previous,
                        category: category.id,
                      }));

                      setShowModal(true);
                    }}
                  >
                    Manage Collection
                  </button>

                  <button
                    type="button"
                    className="content-preview-button"
                    onClick={() => {
                      console.log(
                        `Preview ${category.title}`
                      );
                    }}
                  >
                    Preview Assets
                    <span>→</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* =====================================
            Added Resources
        ===================================== */}

        {contentItems.length > 0 && (
          <div className="content-resources-section">

            <div className="content-resources-header">
              <div>
                <h2>Added Resources</h2>
                <p>
                  Resources currently added to the frontend
                  content library.
                </p>
              </div>
            </div>

            <div className="content-resource-list">
              {contentItems.map((item) => {
                const category = categoryConfig.find(
                  (config) =>
                    config.id === item.category
                );

                return (
                  <div
                    key={item.id}
                    className="content-resource-item"
                  >
                    <div
                      className={`content-resource-icon ${category?.bg ?? "bg-slate-50"
                        } ${category?.iconColor ??
                        "text-slate-600"
                        }`}
                    >
                      {category?.icon}
                    </div>

                    <div className="content-resource-info">
                      <strong>{item.title}</strong>

                      <span>
                        {category?.title}
                      </span>

                      <p>{item.description}</p>
                    </div>

                    <button
                      type="button"
                      className="content-delete-button"
                      onClick={() =>
                        handleDeleteResource(item.id)
                      }
                    >
                      Delete
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* =====================================
            Add Resource Modal
        ===================================== */}

        {showModal && (
          <div
            className="content-modal-overlay"
            onClick={() => setShowModal(false)}
          >
            <div
              className="content-modal"
              onClick={(event) =>
                event.stopPropagation()
              }
            >
              <div className="content-modal-header">
                <div>
                  <h2>Add Resource</h2>

                  <p>
                    Add a new frontend content resource.
                  </p>
                </div>

                <button
                  type="button"
                  className="content-modal-close"
                  onClick={() =>
                    setShowModal(false)
                  }
                >
                  ×
                </button>
              </div>

              <form
                onSubmit={handleAddResource}
                className="content-resource-form"
              >
                {/* Title */}
                <div className="content-form-group">
                  <label htmlFor="resource-title">
                    Resource Title
                  </label>

                  <input
                    id="resource-title"
                    type="text"
                    value={formData.title}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        title: event.target.value,
                      }))
                    }
                    placeholder="e.g. Addition Worksheet"
                    required
                  />
                </div>

                {/* Category */}
                <div className="content-form-group">
                  <label htmlFor="resource-category">
                    Category
                  </label>

                  <select
                    id="resource-category"
                    value={formData.category}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        category:
                          event.target
                            .value as ContentCategory,
                      }))
                    }
                  >
                    {categoryConfig.map(
                      (category) => (
                        <option
                          key={category.id}
                          value={category.id}
                        >
                          {category.title}
                        </option>
                      )
                    )}
                  </select>
                </div>

                {/* Description */}
                <div className="content-form-group">
                  <label htmlFor="resource-description">
                    Description
                  </label>

                  <textarea
                    id="resource-description"
                    value={formData.description}
                    onChange={(event) =>
                      setFormData((previous) => ({
                        ...previous,
                        description:
                          event.target.value,
                      }))
                    }
                    placeholder="Describe this resource..."
                    rows={4}
                  />
                </div>

                <div className="content-form-actions">
                  <button
                    type="button"
                    className="content-cancel-button"
                    onClick={() =>
                      setShowModal(false)
                    }
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="admin-primary-button"
                  >
                    <Plus className="h-4 w-4" />
                    Add Resource
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}