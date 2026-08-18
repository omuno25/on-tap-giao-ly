import { describe, expect, test } from "bun:test";
import {
  buildGroupExamLeaderboard,
  createExamRoomCode,
  EXAM_ROOM_CODE_LENGTH,
  normalizeExamRoomCode,
} from "@/lib/group-exam";

describe("group exam helpers", () => {
  test("chuẩn hóa mã phòng thành 6 ký tự chữ và số", () => {
    expect(normalizeExamRoomCode(" ab-c12!3xyz ")).toBe("ABC123");
    expect(normalizeExamRoomCode("À1")).toBe("AF1");
    expect(normalizeExamRoomCode("Ấ2")).toBe("AAS2");
    expect(normalizeExamRoomCode("Ơ3")).toBe("OW3");
    expect(normalizeExamRoomCode("Đ4")).toBe("DD4");
  });

  test("tạo mã phòng dễ chia sẻ", () => {
    const roomCode = createExamRoomCode();

    expect(roomCode).toHaveLength(EXAM_ROOM_CODE_LENGTH);
    expect(roomCode).toMatch(/^[A-Z2-9]{6}$/);
  });

  test("xếp hạng theo số câu đúng và giữ đồng hạng", () => {
    const leaderboard = buildGroupExamLeaderboard(
      { userId: "host", name: "Chủ phòng" },
      [
        { userId: "user-1", name: "An" },
        { userId: "user-2", name: "Bình" },
        { userId: "user-3", name: "Chi" },
      ],
      [
        { userId: "host", correctCount: 16 },
        { userId: "user-1", correctCount: 18 },
        { userId: "user-2", correctCount: 18 },
      ],
    );

    expect(leaderboard.map(({ userId, rank, submitted }) => ({
      userId,
      rank,
      submitted,
    }))).toEqual([
      { userId: "user-1", rank: 1, submitted: true },
      { userId: "user-2", rank: 1, submitted: true },
      { userId: "host", rank: 3, submitted: true },
      { userId: "user-3", rank: 0, submitted: false },
    ]);
  });
});
