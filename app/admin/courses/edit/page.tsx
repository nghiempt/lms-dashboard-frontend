"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import AdminShell from "../../../components/AdminShell";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface Lesson {
  id: string;
  title: string;
  videoType: "YouTube" | "Bunny";
  videoId: string;
  pricing: "Miễn phí" | "Có phí";
  level: "Cơ bản" | "Nâng cao";
  lock: "Mở khóa" | "Khóa";
  /** When truthy, the lesson was just added and should show the flash class. */
  flash: boolean;
}

interface Chapter {
  id: string;
  title: string;
  lessons: Lesson[];
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

let _seq = 0;
function uid() {
  return "id_" + ++_seq + "_" + Math.random().toString(36).slice(2, 7);
}

function makeLesson(overrides: Partial<Lesson> = {}): Lesson {
  return {
    id: uid(),
    title: "",
    videoType: "YouTube",
    videoId: "",
    pricing: "Miễn phí",
    level: "Cơ bản",
    lock: "Mở khóa",
    flash: false,
    ...overrides,
  };
}

function makeChapter(title: string, lessons: Partial<Lesson>[] = []): Chapter {
  return {
    id: uid(),
    title,
    lessons: lessons.map((l) => makeLesson(l)),
  };
}

// ---------------------------------------------------------------------------
// Initial seed data (matches the HTML source exactly)
// ---------------------------------------------------------------------------

const INITIAL_CHAPTERS: Chapter[] = [
  makeChapter("Chương 1: Nhập môn & Tư duy nghề", [
    {
      title: "Chào mừng & lộ trình",
      videoType: "YouTube",
      videoId: "dQw4w9WgXcQ",
      pricing: "Miễn phí",
      level: "Cơ bản",
      lock: "Mở khóa",
    },
    {
      title: "Định vị bản thân thị trường quốc tế",
      videoType: "Bunny",
      videoId: "vid_8h2k...",
      pricing: "Có phí",
      level: "Cơ bản",
      lock: "Khóa",
    },
  ]),
  makeChapter("Chương 2: Devin Jatho Style", [
    {
      title: "Phân tích DNA style",
      videoType: "Bunny",
      videoId: "vid_a91x...",
      pricing: "Có phí",
      level: "Nâng cao",
      lock: "Khóa",
    },
    {
      title: "Pacing & nhịp cắt",
      videoType: "YouTube",
      videoId: "abc123XYZ",
      pricing: "Có phí",
      level: "Nâng cao",
      lock: "Khóa",
    },
  ]),
];

// ---------------------------------------------------------------------------
// Trash icon (reused)
// ---------------------------------------------------------------------------

const TrashIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M3 6h18M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
  </svg>
);

// Plus icon (reused)
const PlusIcon = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 5v14M5 12h14" />
  </svg>
);

// ---------------------------------------------------------------------------
// LessonRow
// ---------------------------------------------------------------------------

interface LessonRowProps {
  lesson: Lesson;
  chapterIndex: number;
  lessonIndex: number;
  onChange: (field: keyof Lesson, value: string | boolean) => void;
  onDelete: () => void;
}

function LessonRow({ lesson, chapterIndex, lessonIndex, onChange, onDelete }: LessonRowProps) {
  const titleRef = useRef<HTMLInputElement>(null);

  // Auto-focus newly added lessons
  useEffect(() => {
    if (lesson.flash && titleRef.current) {
      titleRef.current.focus();
    }
  }, [lesson.flash]);

  return (
    <div className={"lesson" + (lesson.flash ? " flash" : "")}>
      <div className="ls-h">
        <span className="ls-no">
          {chapterIndex + 1}.{lessonIndex + 1}
        </span>
        <input
          ref={titleRef}
          className="fld ls-title"
          placeholder="Tên bài học"
          value={lesson.title}
          onChange={(e) => onChange("title", e.target.value)}
        />
        <button className="ls-del icon-btn-sm" title="Xóa bài" type="button" onClick={onDelete}>
          {TrashIcon}
        </button>
      </div>
      <div className="ls-meta">
        <select
          className="fld"
          value={lesson.videoType}
          onChange={(e) => onChange("videoType", e.target.value)}
        >
          <option>YouTube</option>
          <option>Bunny</option>
        </select>
        <input
          className="fld"
          placeholder="Video ID / URL"
          value={lesson.videoId}
          onChange={(e) => onChange("videoId", e.target.value)}
        />
        <select
          className="fld"
          value={lesson.pricing}
          onChange={(e) => onChange("pricing", e.target.value)}
        >
          <option>Miễn phí</option>
          <option>Có phí</option>
        </select>
        <select
          className="fld"
          value={lesson.level}
          onChange={(e) => onChange("level", e.target.value)}
        >
          <option>Cơ bản</option>
          <option>Nâng cao</option>
        </select>
        <select
          className="fld"
          value={lesson.lock}
          onChange={(e) => onChange("lock", e.target.value)}
        >
          <option>Mở khóa</option>
          <option>Khóa</option>
        </select>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ChapterBlock
// ---------------------------------------------------------------------------

interface ChapterBlockProps {
  chapter: Chapter;
  chapterIndex: number;
  onAddLesson: () => void;
  onDeleteChapter: () => void;
  onDeleteLesson: (lessonIndex: number) => void;
  onChangeLesson: (lessonIndex: number, field: keyof Lesson, value: string | boolean) => void;
  onChangeTitle: (value: string) => void;
}

function ChapterBlock({
  chapter,
  chapterIndex,
  onAddLesson,
  onDeleteChapter,
  onDeleteLesson,
  onChangeLesson,
  onChangeTitle,
}: ChapterBlockProps) {
  return (
    <div className="chapter">
      <div className="ch-h">
        <input
          className="fld ch-title"
          value={chapter.title}
          onChange={(e) => onChangeTitle(e.target.value)}
        />
        <div className="ch-act">
          <button className="btn-add add-lesson" type="button" onClick={onAddLesson}>
            {PlusIcon}Bài học
          </button>
          <button
            className="icon-btn-sm ch-del"
            title="Xóa chương"
            type="button"
            onClick={onDeleteChapter}
          >
            {TrashIcon}
          </button>
        </div>
      </div>
      <div className="lessons">
        {chapter.lessons.map((lesson, lessonIndex) => (
          <LessonRow
            key={lesson.id}
            lesson={lesson}
            chapterIndex={chapterIndex}
            lessonIndex={lessonIndex}
            onChange={(field, value) => onChangeLesson(lessonIndex, field, value)}
            onDelete={() => onDeleteLesson(lessonIndex)}
          />
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main page
// ---------------------------------------------------------------------------

export default function CourseEditPage() {
  const [chapters, setChapters] = useState<Chapter[]>(INITIAL_CHAPTERS);
  const [chModalOpen, setChModalOpen] = useState(false);
  const [chTitleInput, setChTitleInput] = useState("");
  const chTitleRef = useRef<HTMLInputElement>(null);

  // Open chModal
  function openChModal() {
    setChModalOpen(true);
  }

  // Close chModal
  const closeChModal = useCallback(() => {
    setChModalOpen(false);
    setChTitleInput("");
  }, []);

  // Focus chTitle input when modal opens
  useEffect(() => {
    if (chModalOpen && chTitleRef.current) {
      chTitleRef.current.focus();
    }
  }, [chModalOpen]);

  // Escape closes chModal
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeChModal();
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [closeChModal]);

  // Create chapter from modal
  function createChapter() {
    const title = (chTitleInput.trim() || "Chương " + (chapters.length + 1));
    setChapters((prev) => [...prev, makeChapter(title)]);
    closeChModal();
  }

  // Add lesson to a chapter
  function addLesson(chapterIndex: number) {
    setChapters((prev) => {
      const next = prev.map((ch, ci) => {
        if (ci !== chapterIndex) return ch;
        const newLesson = makeLesson({ flash: true });
        return { ...ch, lessons: [...ch.lessons, newLesson] };
      });
      return next;
    });
    // Remove flash after 900ms
    setTimeout(() => {
      setChapters((prev) =>
        prev.map((ch, ci) => {
          if (ci !== chapterIndex) return ch;
          return {
            ...ch,
            lessons: ch.lessons.map((ls) => (ls.flash ? { ...ls, flash: false } : ls)),
          };
        })
      );
    }, 900);
  }

  // Delete chapter
  function deleteChapter(chapterIndex: number) {
    setChapters((prev) => prev.filter((_, ci) => ci !== chapterIndex));
  }

  // Delete lesson
  function deleteLesson(chapterIndex: number, lessonIndex: number) {
    setChapters((prev) =>
      prev.map((ch, ci) => {
        if (ci !== chapterIndex) return ch;
        return { ...ch, lessons: ch.lessons.filter((_, li) => li !== lessonIndex) };
      })
    );
  }

  // Change lesson field
  function changeLessonField(
    chapterIndex: number,
    lessonIndex: number,
    field: keyof Lesson,
    value: string | boolean
  ) {
    setChapters((prev) =>
      prev.map((ch, ci) => {
        if (ci !== chapterIndex) return ch;
        return {
          ...ch,
          lessons: ch.lessons.map((ls, li) => {
            if (li !== lessonIndex) return ls;
            return { ...ls, [field]: value };
          }),
        };
      })
    );
  }

  // Change chapter title
  function changeChapterTitle(chapterIndex: number, value: string) {
    setChapters((prev) =>
      prev.map((ch, ci) => (ci === chapterIndex ? { ...ch, title: value } : ch))
    );
  }

  return (
    <AdminShell
      title="Chỉnh sửa khóa học"
      subtitle="Khóa Premium — quản lý chương, bài học & video."
      actions={
        <Link className="btn-sm" href="/admin/courses">
          Lưu khóa học
        </Link>
      }
    >
      {/* Course info panel */}
      <div className="panel" style={{ marginBottom: 16 }}>
        <div className="panel-h">
          <h3>Thông tin khóa học</h3>
        </div>
        <div className="cmeta">
          <div className="fwrap">
            <label className="flabel">Tiêu đề khóa học</label>
            <input className="fld" defaultValue="Khóa Premium" />
          </div>
          <div className="fwrap">
            <label className="flabel">Giá (VNĐ)</label>
            <input className="fld" defaultValue="5.890.000" />
          </div>
        </div>
        <div className="fwrap">
          <label className="flabel">Mô tả ngắn</label>
          <textarea
            className="fld"
            rows={2}
            defaultValue="Toàn bộ kỹ năng talking head nâng cao — Devin Jatho & Apple Style."
          />
        </div>
      </div>

      {/* Curriculum builder header */}
      <div className="bld-h">
        <h3 style={{ fontSize: 17, fontWeight: 700 }}>Chương & bài học</h3>
        <button className="btn-sm" id="addChapter" type="button" onClick={openChModal}>
          {PlusIcon}Thêm chương
        </button>
      </div>

      {/* Chapters list */}
      <div id="chapters">
        {chapters.map((chapter, chapterIndex) => (
          <ChapterBlock
            key={chapter.id}
            chapter={chapter}
            chapterIndex={chapterIndex}
            onAddLesson={() => addLesson(chapterIndex)}
            onDeleteChapter={() => deleteChapter(chapterIndex)}
            onDeleteLesson={(li) => deleteLesson(chapterIndex, li)}
            onChangeLesson={(li, field, value) => changeLessonField(chapterIndex, li, field, value)}
            onChangeTitle={(value) => changeChapterTitle(chapterIndex, value)}
          />
        ))}
      </div>

      {/* Add chapter modal */}
      <div
        className={"modal-ov" + (chModalOpen ? " open" : "")}
        id="chModal"
        onClick={(e) => e.target === e.currentTarget && closeChModal()}
      >
        <div className="modal">
          <div className="modal-ic">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
              <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
            </svg>
          </div>
          <h3>Thêm chương mới</h3>
          <div className="fwrap" style={{ marginBottom: 16 }}>
            <label className="flabel">Tên chương</label>
            <input
              id="chTitle"
              ref={chTitleRef}
              className="fld"
              placeholder={"Chương " + (chapters.length + 1)}
              value={chTitleInput}
              onChange={(e) => setChTitleInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") createChapter();
              }}
            />
          </div>
          <div className="modal-act">
            <button className="btn-sec" type="button" data-close onClick={closeChModal}>
              Hủy
            </button>
            <button className="btn-sm" id="chCreate" type="button" onClick={createChapter}>
              Tạo chương
            </button>
          </div>
        </div>
      </div>
    </AdminShell>
  );
}
