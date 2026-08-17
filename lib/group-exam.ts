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
  result: GroupExamResult | null;
  leaderboard: GroupExamLeaderboardEntry[];
  start: GroupExamStart | null;
};

export type ActiveGroupExamRoom = {
  role: "host" | "participant";
  roomCode: string;
};

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
  return value
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, EXAM_ROOM_CODE_LENGTH);
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
  return readStorageJson<HostedExamRoom | null>(
    STORAGE_KEYS.examRoom(normalizeExamRoomCode(roomCode)),
    null,
  );
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
  return readStorageJson<JoinedExamRoom | null>(
    STORAGE_KEYS.joinedExamRoom(normalizeExamRoomCode(roomCode)),
    null,
  );
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
