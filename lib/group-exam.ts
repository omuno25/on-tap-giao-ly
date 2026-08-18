import {
  readStorageJson,
  removeStorageValue,
  STORAGE_KEYS,
  writeStorageJson,
} from "@/lib/app-storage";

export const GROUP_EXAM_DURATION_SECONDS = 25 * 60;
export const GROUP_EXAM_OBJECTIVE_COUNT = 15;
export const GROUP_EXAM_ESSAY_COUNT = 4;
export const GROUP_EXAM_TRUE_FALSE_COUNT = 1;
export const EXAM_ROOM_CODE_LENGTH = 6;

export type ExamRoomParticipant = {
  userId: string;
  name: string;
  peerId: string;
  connected: boolean;
  joinedAt: string;
  lastSeenAt: string;
  rejoinRequested?: boolean;
};

export type GroupExamStart = {
  roomCode: string;
  questionSetHash: string;
  startedAt: string;
  expiresAt: string;
  durationSeconds: number;
};

export type GroupExamRoomState = {
  status: HostedExamRoom["status"];
  start: GroupExamStart | null;
};

export type GroupExamResult = {
  userId: string;
  correctCount: number;
};

export type GroupExamLeaderboardEntry = GroupExamResult & {
  name: string;
  rank: number;
  submitted: boolean;
};

export type HostedExamRoom = {
  version: 1;
  roomCode: string;
  hostUserId: string;
  hostName: string;
  createdAt: string;
  status: "lobby" | "started" | "completed";
  participants: ExamRoomParticipant[];
  kickedUserIds: string[];
  results: GroupExamResult[];
  start: GroupExamStart | null;
};

export type JoinedExamRoom = {
  version: 1;
  roomCode: string;
  hostUserId: string;
  hostName: string;
  participantUserId: string;
  participantName: string;
  status: HostedExamRoom["status"];
  result: GroupExamResult | null;
  leaderboard: GroupExamLeaderboardEntry[];
  start: GroupExamStart | null;
};

export type ActiveGroupExamRoom = {
  role: "host" | "participant";
  roomCode: string;
};

export type GroupExamHistoryEntry = {
  version: 1;
  roomCode: string;
  role: ActiveGroupExamRoom["role"];
  userId: string;
  name: string;
  hostName: string;
  status: HostedExamRoom["status"];
  questionSetHash: string;
  startedAt: string;
  expiresAt: string;
  submittedAt: string | null;
  result: GroupExamResult | null;
  leaderboard: GroupExamLeaderboardEntry[];
  updatedAt: string;
};

const MAX_GROUP_EXAM_HISTORY = 50;

export function readGroupExamHistory() {
  const history = readStorageJson<unknown>(STORAGE_KEYS.groupExamHistory, []);
  return Array.isArray(history)
    ? history.filter(isGroupExamHistoryEntry)
    : [];
}

export function readGroupExamHistoryEntry(
  roomCode: string,
  role: ActiveGroupExamRoom["role"],
  userId: string,
) {
  const normalizedRoomCode = normalizeExamRoomCode(roomCode);
  return (
    readGroupExamHistory().find(
      (entry) =>
        entry.roomCode === normalizedRoomCode &&
        entry.role === role &&
        entry.userId === userId,
    ) ?? null
  );
}

export function saveGroupExamHistoryEntry(entry: GroupExamHistoryEntry) {
  const normalized = {
    ...entry,
    roomCode: normalizeExamRoomCode(entry.roomCode),
    updatedAt: new Date().toISOString(),
  };
  const history = readGroupExamHistory().filter(
    (item) =>
      !(
        item.roomCode === normalized.roomCode &&
        item.role === normalized.role &&
        item.userId === normalized.userId
      ),
  );
  writeStorageJson(
    STORAGE_KEYS.groupExamHistory,
    [normalized, ...history].slice(0, MAX_GROUP_EXAM_HISTORY),
  );
  return normalized;
}

function isGroupExamHistoryEntry(value: unknown): value is GroupExamHistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Record<string, unknown>;
  return (
    entry.version === 1 &&
    typeof entry.roomCode === "string" &&
    (entry.role === "host" || entry.role === "participant") &&
    typeof entry.userId === "string" &&
    typeof entry.name === "string" &&
    typeof entry.hostName === "string" &&
    (entry.status === "lobby" ||
      entry.status === "started" ||
      entry.status === "completed") &&
    typeof entry.questionSetHash === "string" &&
    typeof entry.startedAt === "string" &&
    typeof entry.expiresAt === "string" &&
    (entry.submittedAt === null || typeof entry.submittedAt === "string") &&
    (entry.result === null ||
      (typeof entry.result === "object" && entry.result !== null)) &&
    Array.isArray(entry.leaderboard) &&
    typeof entry.updatedAt === "string"
  );
}

export function buildGroupExamLeaderboard(
  host: { userId: string; name: string },
  participants: Array<{ userId: string; name: string }>,
  results: GroupExamResult[],
) {
  const people = [host, ...participants].filter(
    (person, index, all) =>
      all.findIndex((item) => item.userId === person.userId) === index,
  );
  const resultByUserId = new Map(
    results.map((result) => [result.userId, result]),
  );
  const submitted = people
    .filter((person) => resultByUserId.has(person.userId))
    .sort(
      (first, second) =>
        (resultByUserId.get(second.userId)?.correctCount ?? 0) -
        (resultByUserId.get(first.userId)?.correctCount ?? 0),
    );
  let previousScore: number | null = null;
  let previousRank = 0;
  const ranked = submitted.map((person, index) => {
    const result = resultByUserId.get(person.userId)!;
    const rank =
      previousScore === result.correctCount ? previousRank : index + 1;
    previousScore = result.correctCount;
    previousRank = rank;
    return { ...person, ...result, rank, submitted: true };
  });

  return [
    ...ranked,
    ...people
      .filter((person) => !resultByUserId.has(person.userId))
      .map((person) => ({
        ...person,
        correctCount: 0,
        rank: 0,
        submitted: false,
      })),
  ] satisfies GroupExamLeaderboardEntry[];
}

export function normalizeExamRoomCode(value: string) {
  let normalized = "";
  let previousBase = "";

  for (const character of value.normalize("NFD")) {
    if (/[A-Za-z0-9]/.test(character)) {
      previousBase = character.toUpperCase();
      normalized += previousBase;
      continue;
    }
    if (character === "đ" || character === "Đ") {
      previousBase = "D";
      normalized += "DD";
      continue;
    }

    // Khôi phục phím Telex mà bộ gõ tiếng Việt đã chuyển thành Unicode.
    if (character === "\u0302") normalized += previousBase; // â/ê/ô → aa/ee/oo
    else if (character === "\u0306") normalized += "W"; // ă → aw
    else if (character === "\u031B") {
      if (previousBase === "U") {
        // Với Telex, nhấn W riêng có thể được bộ gõ biểu diễn thành "ư".
        // Đổi U vừa thêm thành W để mã phòng không bị thành "UW".
        normalized = `${normalized.slice(0, -1)}W`;
        previousBase = "W";
      } else {
        normalized += "W"; // ơ → ow
      }
    }
    else if (character === "\u0301") normalized += "S"; // sắc
    else if (character === "\u0300") normalized += "F"; // huyền
    else if (character === "\u0309") normalized += "R"; // hỏi
    else if (character === "\u0303") normalized += "X"; // ngã
    else if (character === "\u0323") normalized += "J"; // nặng
  }

  return normalized.slice(0, EXAM_ROOM_CODE_LENGTH);
}

export function createExamRoomCode() {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  const values = new Uint32Array(EXAM_ROOM_CODE_LENGTH);
  globalThis.crypto.getRandomValues(values);
  return Array.from(values, (value) => alphabet[value % alphabet.length]).join(
    "",
  );
}

export function readHostedExamRoom(roomCode: string) {
  const room = readStorageJson<HostedExamRoom | null>(
    STORAGE_KEYS.examRoom(normalizeExamRoomCode(roomCode)),
    null,
  );
  if (!room) return null;
  return {
    ...room,
    // Migration cho phòng được lưu trước khi có danh sách chặn.
    kickedUserIds: Array.isArray(room.kickedUserIds)
      ? room.kickedUserIds.filter((userId) => typeof userId === "string")
      : [],
  };
}

export function readActiveHostedExamRoom() {
  const roomCode = readStorageJson<string | null>(
    STORAGE_KEYS.activeHostedExamRoom,
    null,
  );
  return roomCode ? readHostedExamRoom(roomCode) : null;
}

export function saveHostedExamRoom(room: HostedExamRoom) {
  writeStorageJson(STORAGE_KEYS.examRoom(room.roomCode), room);
  writeStorageJson(STORAGE_KEYS.activeHostedExamRoom, room.roomCode);
  writeStorageJson(STORAGE_KEYS.activeGroupExamRoom, {
    role: "host",
    roomCode: room.roomCode,
  } satisfies ActiveGroupExamRoom);
}

export function removeHostedExamRoom(roomCode: string) {
  const normalizedRoomCode = normalizeExamRoomCode(roomCode);
  removeStorageValue(STORAGE_KEYS.examRoom(normalizedRoomCode));
  const activeRoomCode = readStorageJson<string | null>(
    STORAGE_KEYS.activeHostedExamRoom,
    null,
  );
  if (activeRoomCode === normalizedRoomCode) {
    removeStorageValue(STORAGE_KEYS.activeHostedExamRoom);
  }
  const activeGroupRoom = readActiveGroupExamRoom();
  if (
    activeGroupRoom?.role === "host" &&
    activeGroupRoom.roomCode === normalizedRoomCode
  ) {
    removeStorageValue(STORAGE_KEYS.activeGroupExamRoom);
  }
}

export function readJoinedExamRoom(roomCode: string) {
  const room = readStorageJson<JoinedExamRoom | null>(
    STORAGE_KEYS.joinedExamRoom(normalizeExamRoomCode(roomCode)),
    null,
  );
  if (!room) return null;
  if (
    room.status === "lobby" ||
    room.status === "started" ||
    room.status === "completed"
  ) {
    return room;
  }
  const migratedRoom = {
    ...room,
    status: room.result ? "completed" : room.start ? "started" : "lobby",
  } satisfies JoinedExamRoom;
  writeStorageJson(
    STORAGE_KEYS.joinedExamRoom(migratedRoom.roomCode),
    migratedRoom,
  );
  return migratedRoom;
}

export function readActiveJoinedExamRoom() {
  const roomCode = readStorageJson<string | null>(
    STORAGE_KEYS.activeJoinedExamRoom,
    null,
  );
  return roomCode ? readJoinedExamRoom(roomCode) : null;
}

export function saveJoinedExamRoom(room: JoinedExamRoom) {
  writeStorageJson(STORAGE_KEYS.joinedExamRoom(room.roomCode), room);
  writeStorageJson(STORAGE_KEYS.activeJoinedExamRoom, room.roomCode);
  writeStorageJson(STORAGE_KEYS.activeGroupExamRoom, {
    role: "participant",
    roomCode: room.roomCode,
  } satisfies ActiveGroupExamRoom);
}

export function removeJoinedExamRoom(roomCode: string) {
  const normalizedRoomCode = normalizeExamRoomCode(roomCode);
  removeStorageValue(STORAGE_KEYS.joinedExamRoom(normalizedRoomCode));
  const activeRoomCode = readStorageJson<string | null>(
    STORAGE_KEYS.activeJoinedExamRoom,
    null,
  );
  if (activeRoomCode === normalizedRoomCode) {
    removeStorageValue(STORAGE_KEYS.activeJoinedExamRoom);
  }
  const activeGroupRoom = readActiveGroupExamRoom();
  if (
    activeGroupRoom?.role === "participant" &&
    activeGroupRoom.roomCode === normalizedRoomCode
  ) {
    removeStorageValue(STORAGE_KEYS.activeGroupExamRoom);
  }
}

export function readActiveGroupExamRoom() {
  const active = readStorageJson<ActiveGroupExamRoom | null>(
    STORAGE_KEYS.activeGroupExamRoom,
    null,
  );
  if (!active || (active.role !== "host" && active.role !== "participant")) {
    return null;
  }
  const roomCode = normalizeExamRoomCode(active.roomCode);
  return roomCode ? { ...active, roomCode } : null;
}
