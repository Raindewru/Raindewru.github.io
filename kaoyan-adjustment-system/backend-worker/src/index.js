import bcrypt from 'bcryptjs';
import { SignJWT, jwtVerify } from 'jose';

const STUDENT_COLUMNS = [
  'id',
  'year',
  'school',
  'region',
  'school_category',
  'college',
  'major_code',
  'major_name',
  'study_form',
  'student_id',
  'total_score',
  'first_choice_school',
  'remark'
];

const USER_SAFE_COLUMNS = ['id', 'username', 'role', 'expire_date', 'allowed_major_prefixes'];

const ORDER_FIELD_META = {
  id: { orderExpr: 'id', cursorExpr: 'id' },
  year: { orderExpr: 'COALESCE(year, -1)', cursorExpr: 'COALESCE(year, -1)' },
  school: { orderExpr: "COALESCE(school, '')", cursorExpr: "COALESCE(school, '')" },
  region: { orderExpr: "COALESCE(region, '')", cursorExpr: "COALESCE(region, '')" },
  school_category: {
    orderExpr: "COALESCE(school_category, '')",
    cursorExpr: "COALESCE(school_category, '')"
  },
  college: { orderExpr: "COALESCE(college, '')", cursorExpr: "COALESCE(college, '')" },
  major_code: { orderExpr: "COALESCE(major_code, '')", cursorExpr: "COALESCE(major_code, '')" },
  major_name: { orderExpr: "COALESCE(major_name, '')", cursorExpr: "COALESCE(major_name, '')" },
  study_form: { orderExpr: "COALESCE(study_form, '')", cursorExpr: "COALESCE(study_form, '')" },
  student_id: { orderExpr: "COALESCE(student_id, '')", cursorExpr: "COALESCE(student_id, '')" },
  total_score: {
    orderExpr: 'COALESCE(total_score, -1)',
    cursorExpr: 'COALESCE(total_score, -1)'
  },
  first_choice_school: {
    orderExpr: "COALESCE(first_choice_school, '')",
    cursorExpr: "COALESCE(first_choice_school, '')"
  },
  remark: { orderExpr: "COALESCE(remark, '')", cursorExpr: "COALESCE(remark, '')" }
};

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;
const DEFAULT_BCRYPT_ROUNDS = 10;

function toInt(value, fallback = null) {
  if (value === null || value === undefined || value === '') {
    return fallback;
  }
  const number = Number.parseInt(value, 10);
  return Number.isNaN(number) ? fallback : number;
}

function normalizeRole(value) {
  return value === 'admin' ? 'admin' : 'user';
}

function normalizePrefixList(input) {
  if (input === null || input === undefined) {
    return [];
  }
  const source = Array.isArray(input) ? input : String(input).split(',');
  return [...new Set(source.map((item) => String(item).trim()).filter(Boolean))];
}

function serializePrefixList(prefixes) {
  if (!Array.isArray(prefixes) || prefixes.length === 0) {
    return null;
  }
  return prefixes.join(',');
}

function normalizeDateValue(value) {
  if (value === null || value === undefined) {
    return null;
  }
  const text = String(value).trim();
  return text === '' ? null : text;
}

function isValidDateString(dateText) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateText || '');
}

function todayDateString() {
  return new Date().toISOString().slice(0, 10);
}

function isExpired(expireDate) {
  if (!expireDate) {
    return false;
  }
  return todayDateString() > expireDate;
}

function daysUntilExpire(expireDate) {
  if (!expireDate || !isValidDateString(expireDate)) {
    return null;
  }
  const now = new Date(`${todayDateString()}T00:00:00Z`);
  const target = new Date(`${expireDate}T00:00:00Z`);
  return Math.floor((target.getTime() - now.getTime()) / 86400000);
}

function normalizeUserForClient(row) {
  return {
    id: Number(row.id),
    username: row.username,
    role: normalizeRole(row.role),
    expire_date: row.expire_date || null,
    allowed_major_prefixes: normalizePrefixList(row.allowed_major_prefixes),
    days_until_expire: daysUntilExpire(row.expire_date || null)
  };
}

function getAllowedOrigins(env) {
  const originRaw = (env.CORS_ORIGIN || '*').trim();
  if (originRaw === '*') {
    return '*';
  }
  return originRaw
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);
}

function getCorsHeaders(env, requestOrigin) {
  const allowedOrigins = getAllowedOrigins(env);
  let allowOrigin = '*';

  if (Array.isArray(allowedOrigins)) {
    if (requestOrigin && allowedOrigins.includes(requestOrigin)) {
      allowOrigin = requestOrigin;
    } else if (allowedOrigins.length > 0) {
      allowOrigin = allowedOrigins[0];
    }
  }

  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin'
  };
}

function okResponse(data, message, status, corsHeaders) {
  return new Response(
    JSON.stringify({
      success: true,
      message: message || 'OK',
      data: data ?? null
    }),
    {
      status: status || 200,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders
      }
    }
  );
}

function errorResponse(message, status, corsHeaders, details = null) {
  return new Response(
    JSON.stringify({
      success: false,
      message: message || 'Request failed',
      details
    }),
    {
      status: status || 400,
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        ...corsHeaders
      }
    }
  );
}

function getJwtSecret(env) {
  if (!env.JWT_SECRET) {
    throw new Error('Missing JWT_SECRET environment variable.');
  }
  return new TextEncoder().encode(env.JWT_SECRET);
}

function getBcryptRounds(env) {
  const rounds = toInt(env.BCRYPT_SALT_ROUNDS, DEFAULT_BCRYPT_ROUNDS) || DEFAULT_BCRYPT_ROUNDS;
  return Math.min(14, Math.max(4, rounds));
}

function isAdmin(auth) {
  return auth.role === 'admin';
}

function addExactFilter(queryValue, columnName, clauses, binds) {
  if (queryValue !== null && queryValue !== undefined && queryValue !== '') {
    clauses.push(`${columnName} = ?`);
    binds.push(queryValue);
  }
}

function addLikeFilter(queryValue, columnName, clauses, binds) {
  if (queryValue !== null && queryValue !== undefined && queryValue !== '') {
    clauses.push(`${columnName} LIKE ?`);
    binds.push(`%${queryValue}%`);
  }
}

function addPrefixFilter(queryValue, columnName, clauses, binds) {
  if (queryValue !== null && queryValue !== undefined && queryValue !== '') {
    clauses.push(`${columnName} LIKE ?`);
    binds.push(`${queryValue}%`);
  }
}

function buildFilterClauses(params) {
  const clauses = [];
  const binds = [];

  const year = toInt(params.get('year'));
  const minScore = toInt(params.get('min_score'));
  const maxScore = toInt(params.get('max_score'));

  if (year !== null) {
    clauses.push('year = ?');
    binds.push(year);
  }

  addLikeFilter(params.get('school'), 'school', clauses, binds);
  addExactFilter(params.get('region'), 'region', clauses, binds);
  addExactFilter(params.get('school_category'), 'school_category', clauses, binds);
  addLikeFilter(params.get('college'), 'college', clauses, binds);
  addExactFilter(params.get('major_code'), 'major_code', clauses, binds);
  addPrefixFilter(params.get('major_prefix'), 'major_code', clauses, binds);
  addLikeFilter(params.get('major_name'), 'major_name', clauses, binds);
  addExactFilter(params.get('study_form'), 'study_form', clauses, binds);
  addExactFilter(params.get('student_id'), 'student_id', clauses, binds);
  addLikeFilter(params.get('first_choice_school'), 'first_choice_school', clauses, binds);

  if (minScore !== null) {
    clauses.push('total_score >= ?');
    binds.push(minScore);
  }

  if (maxScore !== null) {
    clauses.push('total_score <= ?');
    binds.push(maxScore);
  }

  return { clauses, binds };
}

function addMajorPermissionFilter(auth, clauses, binds) {
  if (isAdmin(auth)) {
    return;
  }

  const prefixes = normalizePrefixList(auth.allowed_major_prefixes);
  if (prefixes.length === 0) {
    return;
  }

  clauses.push(`(${prefixes.map(() => 'major_code LIKE ?').join(' OR ')})`);
  prefixes.forEach((prefix) => binds.push(`${prefix}%`));
}

async function signToken(user, env) {
  const jwtSecret = getJwtSecret(env);
  const tokenPayload = {
    user_id: Number(user.id),
    username: user.username,
    role: normalizeRole(user.role),
    expire_date: user.expire_date || null,
    allowed_major_prefixes: normalizePrefixList(user.allowed_major_prefixes)
  };

  return new SignJWT(tokenPayload)
    .setProtectedHeader({ alg: 'HS256', typ: 'JWT' })
    .setSubject(user.username)
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(jwtSecret);
}

async function getUserById(env, id) {
  return env.DB.prepare(
    `
      SELECT id, username, password_hash, role, expire_date, allowed_major_prefixes
      FROM users
      WHERE id = ?
      LIMIT 1
    `
  )
    .bind(id)
    .first();
}

async function getUserByUsername(env, username) {
  return env.DB.prepare(
    `
      SELECT id, username, password_hash, role, expire_date, allowed_major_prefixes
      FROM users
      WHERE username = ?
      LIMIT 1
    `
  )
    .bind(username)
    .first();
}

async function verifyAuth(request, env) {
  const authHeader = request.headers.get('Authorization') || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return { ok: false, status: 401, message: 'Missing or invalid Bearer token.' };
  }

  try {
    const jwtSecret = getJwtSecret(env);
    const { payload } = await jwtVerify(token, jwtSecret);
    const userId = toInt(payload.user_id);

    if (!userId) {
      return { ok: false, status: 401, message: 'Invalid token payload.' };
    }

    const user = await getUserById(env, userId);
    if (!user) {
      return { ok: false, status: 401, message: 'User no longer exists.' };
    }

    if (user.expire_date && !isValidDateString(user.expire_date)) {
      return { ok: false, status: 403, message: 'Invalid user expire_date format.' };
    }

    if (isExpired(user.expire_date)) {
      return { ok: false, status: 403, message: 'Account expired.' };
    }

    return { ok: true, auth: normalizeUserForClient(user), payload };
  } catch {
    return { ok: false, status: 401, message: 'Token invalid or expired.' };
  }
}

function validateRole(role) {
  return role === 'admin' || role === 'user';
}

function parseUserWritePayload(body, requirePassword) {
  const errors = [];
  const output = {};

  if (body.username !== undefined) {
    const username = String(body.username || '').trim();
    if (!username) {
      errors.push('username cannot be empty.');
    } else {
      output.username = username;
    }
  } else if (requirePassword) {
    errors.push('username is required.');
  }

  if (body.password !== undefined) {
    const password = String(body.password || '');
    if (!password) {
      errors.push('password cannot be empty.');
    } else {
      output.password = password;
    }
  } else if (requirePassword) {
    errors.push('password is required.');
  }

  if (body.role !== undefined) {
    const role = String(body.role || '').trim();
    if (!validateRole(role)) {
      errors.push('role must be admin or user.');
    } else {
      output.role = role;
    }
  } else if (requirePassword) {
    output.role = 'user';
  }

  if (body.expire_date !== undefined) {
    const expireDate = normalizeDateValue(body.expire_date);
    if (expireDate && !isValidDateString(expireDate)) {
      errors.push('expire_date must be YYYY-MM-DD.');
    } else {
      output.expire_date = expireDate;
    }
  } else if (requirePassword) {
    output.expire_date = null;
  }

  if (body.allowed_major_prefixes !== undefined) {
    output.allowed_major_prefixes = normalizePrefixList(body.allowed_major_prefixes);
  } else if (requirePassword) {
    output.allowed_major_prefixes = [];
  }

  return { errors, output };
}

async function handleLogin(request, env, corsHeaders) {
  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body must be valid JSON.', 400, corsHeaders);
  }

  const username = String(body?.username || '').trim();
  const password = String(body?.password || '');
  if (!username || !password) {
    return errorResponse('username and password are required.', 400, corsHeaders);
  }

  const user = await getUserByUsername(env, username);
  if (!user) {
    return errorResponse('Invalid username or password.', 401, corsHeaders);
  }

  const passed = await bcrypt.compare(password, user.password_hash || '');
  if (!passed) {
    return errorResponse('Invalid username or password.', 401, corsHeaders);
  }

  if (user.expire_date && !isValidDateString(user.expire_date)) {
    return errorResponse('Account expire_date is invalid.', 403, corsHeaders);
  }
  if (isExpired(user.expire_date)) {
    return errorResponse('Account expired. Login denied.', 403, corsHeaders);
  }

  const token = await signToken(user, env);
  return okResponse(
    {
      token,
      token_type: 'Bearer',
      expires_in_days: 7,
      user: normalizeUserForClient(user)
    },
    'Login succeeded.',
    200,
    corsHeaders
  );
}

async function getCursorSortValue(env, orderBy, filterClauses, filterBinds, cursorId) {
  const { cursorExpr } = ORDER_FIELD_META[orderBy];
  const whereParts = [...filterClauses, 'id = ?'];
  const sql = `
    SELECT ${cursorExpr} AS cursor_sort_value
    FROM students
    WHERE ${whereParts.join(' AND ')}
    LIMIT 1
  `;

  const row = await env.DB.prepare(sql)
    .bind(...filterBinds, cursorId)
    .first();

  return row?.cursor_sort_value;
}

async function handleStudents(request, env, corsHeaders) {
  const authResult = await verifyAuth(request, env);
  if (!authResult.ok) {
    return errorResponse(authResult.message, authResult.status, corsHeaders);
  }

  const auth = authResult.auth;
  const params = new URL(request.url).searchParams;
  const orderByRaw = params.get('order_by') || 'total_score';
  const orderBy = Object.prototype.hasOwnProperty.call(ORDER_FIELD_META, orderByRaw)
    ? orderByRaw
    : 'total_score';
  const order = (params.get('order') || 'desc').toLowerCase() === 'asc' ? 'ASC' : 'DESC';
  const cursor = Math.max(0, toInt(params.get('cursor'), 0) || 0);
  const pageSize = Math.min(
    MAX_PAGE_SIZE,
    Math.max(1, toInt(params.get('page_size'), DEFAULT_PAGE_SIZE) || DEFAULT_PAGE_SIZE)
  );

  const { clauses: filterClauses, binds: filterBinds } = buildFilterClauses(params);
  addMajorPermissionFilter(auth, filterClauses, filterBinds);

  const whereClauses = [...filterClauses];
  const queryBinds = [...filterBinds];

  if (cursor > 0) {
    if (orderBy === 'id') {
      whereClauses.push(order === 'ASC' ? 'id > ?' : 'id < ?');
      queryBinds.push(cursor);
    } else {
      const { orderExpr } = ORDER_FIELD_META[orderBy];
      const cursorSortValue = await getCursorSortValue(env, orderBy, filterClauses, filterBinds, cursor);
      if (cursorSortValue === undefined) {
        return errorResponse('cursor does not match current query scope.', 400, corsHeaders);
      }

      if (order === 'ASC') {
        whereClauses.push(`(${orderExpr} > ? OR (${orderExpr} = ? AND id > ?))`);
      } else {
        whereClauses.push(`(${orderExpr} < ? OR (${orderExpr} = ? AND id < ?))`);
      }
      queryBinds.push(cursorSortValue, cursorSortValue, cursor);
    }
  }

  const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';
  const orderSql =
    orderBy === 'id'
      ? `ORDER BY id ${order}`
      : `ORDER BY ${ORDER_FIELD_META[orderBy].orderExpr} ${order}, id ${order}`;

  const sql = `
    SELECT ${STUDENT_COLUMNS.join(', ')}
    FROM students
    ${whereSql}
    ${orderSql}
    LIMIT ?
  `;

  const result = await env.DB.prepare(sql)
    .bind(...queryBinds, pageSize + 1)
    .all();

  const rows = result.results || [];
  const hasMore = rows.length > pageSize;
  const pageRows = hasMore ? rows.slice(0, pageSize) : rows;
  const nextCursor = hasMore && pageRows.length > 0 ? pageRows[pageRows.length - 1].id : null;

  return okResponse(
    {
      items: pageRows,
      pagination: {
        cursor,
        next_cursor: nextCursor,
        has_more: hasMore,
        page_size: pageSize
      },
      sort: {
        order_by: orderBy,
        order: order.toLowerCase()
      }
    },
    'Query succeeded.',
    200,
    corsHeaders
  );
}

async function handleStats(request, env, corsHeaders) {
  const authResult = await verifyAuth(request, env);
  if (!authResult.ok) {
    return errorResponse(authResult.message, authResult.status, corsHeaders);
  }

  const permissionClauses = [];
  const permissionBinds = [];
  addMajorPermissionFilter(authResult.auth, permissionClauses, permissionBinds);

  const scoreSql = `
    SELECT CAST(total_score / 10 AS INTEGER) * 10 AS bucket_start, COUNT(*) AS count
    FROM students
    WHERE total_score IS NOT NULL
      ${permissionClauses.length ? `AND ${permissionClauses.join(' AND ')}` : ''}
    GROUP BY bucket_start
    ORDER BY bucket_start ASC
  `;

  const yearSql = `
    SELECT year, COUNT(*) AS count
    FROM students
    WHERE year IS NOT NULL
      ${permissionClauses.length ? `AND ${permissionClauses.join(' AND ')}` : ''}
    GROUP BY year
    ORDER BY year ASC
  `;

  const scoreResult = await env.DB.prepare(scoreSql)
    .bind(...permissionBinds)
    .all();
  const yearResult = await env.DB.prepare(yearSql)
    .bind(...permissionBinds)
    .all();

  const scoreDistribution = (scoreResult.results || []).map((row) => ({
    bucket_start: Number(row.bucket_start),
    bucket_end: Number(row.bucket_start) + 9,
    count: Number(row.count)
  }));

  const yearDistribution = (yearResult.results || []).map((row) => ({
    year: Number(row.year),
    count: Number(row.count)
  }));

  return okResponse(
    {
      score_distribution: scoreDistribution,
      year_distribution: yearDistribution
    },
    'Stats succeeded.',
    200,
    corsHeaders
  );
}

async function requireAdmin(request, env, corsHeaders) {
  const authResult = await verifyAuth(request, env);
  if (!authResult.ok) {
    return { ok: false, response: errorResponse(authResult.message, authResult.status, corsHeaders) };
  }
  if (!isAdmin(authResult.auth)) {
    return { ok: false, response: errorResponse('Admin role required.', 403, corsHeaders) };
  }
  return { ok: true, auth: authResult.auth };
}

async function handleGetUsers(request, env, corsHeaders) {
  const adminCheck = await requireAdmin(request, env, corsHeaders);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const result = await env.DB.prepare(
    `
      SELECT ${USER_SAFE_COLUMNS.join(', ')}
      FROM users
      ORDER BY id ASC
    `
  ).all();

  return okResponse(
    { items: (result.results || []).map(normalizeUserForClient) },
    'Users listed.',
    200,
    corsHeaders
  );
}

async function handleCreateUser(request, env, corsHeaders) {
  const adminCheck = await requireAdmin(request, env, corsHeaders);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body must be valid JSON.', 400, corsHeaders);
  }

  const { errors, output } = parseUserWritePayload(body || {}, true);
  if (errors.length > 0) {
    return errorResponse('Validation failed.', 400, corsHeaders, errors);
  }

  const existing = await getUserByUsername(env, output.username);
  if (existing) {
    return errorResponse('username already exists.', 409, corsHeaders);
  }

  const hash = await bcrypt.hash(output.password, getBcryptRounds(env));
  const insertResult = await env.DB.prepare(
    `
      INSERT INTO users (username, password_hash, role, expire_date, allowed_major_prefixes)
      VALUES (?, ?, ?, ?, ?)
    `
  )
    .bind(
      output.username,
      hash,
      output.role || 'user',
      output.expire_date,
      serializePrefixList(output.allowed_major_prefixes)
    )
    .run();

  const createdUser = await getUserById(env, insertResult.meta?.last_row_id);
  return okResponse({ user: normalizeUserForClient(createdUser) }, 'User created.', 201, corsHeaders);
}

async function handleUpdateUser(request, env, corsHeaders, userId) {
  const adminCheck = await requireAdmin(request, env, corsHeaders);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const id = toInt(userId);
  if (!id || id <= 0) {
    return errorResponse('Invalid user id.', 400, corsHeaders);
  }

  const existingUser = await getUserById(env, id);
  if (!existingUser) {
    return errorResponse('User not found.', 404, corsHeaders);
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return errorResponse('Body must be valid JSON.', 400, corsHeaders);
  }

  const { errors, output } = parseUserWritePayload(body || {}, false);
  if (errors.length > 0) {
    return errorResponse('Validation failed.', 400, corsHeaders, errors);
  }

  const setParts = [];
  const binds = [];

  if (output.username !== undefined) {
    if (output.username !== existingUser.username) {
      const conflict = await getUserByUsername(env, output.username);
      if (conflict && Number(conflict.id) !== id) {
        return errorResponse('username already exists.', 409, corsHeaders);
      }
    }
    setParts.push('username = ?');
    binds.push(output.username);
  }

  if (output.password !== undefined) {
    setParts.push('password_hash = ?');
    binds.push(await bcrypt.hash(output.password, getBcryptRounds(env)));
  }

  if (output.role !== undefined) {
    setParts.push('role = ?');
    binds.push(output.role);
  }

  if (output.expire_date !== undefined) {
    setParts.push('expire_date = ?');
    binds.push(output.expire_date);
  }

  if (output.allowed_major_prefixes !== undefined) {
    setParts.push('allowed_major_prefixes = ?');
    binds.push(serializePrefixList(output.allowed_major_prefixes));
  }

  if (setParts.length === 0) {
    return errorResponse('No fields to update.', 400, corsHeaders);
  }

  const sql = `
    UPDATE users
    SET ${setParts.join(', ')}
    WHERE id = ?
  `;

  await env.DB.prepare(sql)
    .bind(...binds, id)
    .run();

  const updated = await getUserById(env, id);
  return okResponse({ user: normalizeUserForClient(updated) }, 'User updated.', 200, corsHeaders);
}

async function handleDeleteUser(request, env, corsHeaders, userId) {
  const adminCheck = await requireAdmin(request, env, corsHeaders);
  if (!adminCheck.ok) {
    return adminCheck.response;
  }

  const id = toInt(userId);
  if (!id || id <= 0) {
    return errorResponse('Invalid user id.', 400, corsHeaders);
  }

  if (Number(adminCheck.auth.id) === id) {
    return errorResponse('Cannot delete current login user.', 400, corsHeaders);
  }

  const result = await env.DB.prepare('DELETE FROM users WHERE id = ?')
    .bind(id)
    .run();

  if ((result.meta?.changes || 0) === 0) {
    return errorResponse('User not found.', 404, corsHeaders);
  }

  return okResponse({ deleted_id: id }, 'User deleted.', 200, corsHeaders);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const corsHeaders = getCorsHeaders(env, request.headers.get('Origin'));

    if (request.method === 'OPTIONS') {
      return new Response(null, { status: 204, headers: corsHeaders });
    }

    try {
      if (url.pathname === '/api/login' && request.method === 'POST') {
        return await handleLogin(request, env, corsHeaders);
      }

      if (url.pathname === '/api/students' && request.method === 'GET') {
        return await handleStudents(request, env, corsHeaders);
      }

      if (url.pathname === '/api/stats' && request.method === 'GET') {
        return await handleStats(request, env, corsHeaders);
      }

      if (url.pathname === '/api/users' && request.method === 'GET') {
        return await handleGetUsers(request, env, corsHeaders);
      }

      if (url.pathname === '/api/users' && request.method === 'POST') {
        return await handleCreateUser(request, env, corsHeaders);
      }

      const userRouteMatch = url.pathname.match(/^\/api\/users\/(\d+)$/);
      if (userRouteMatch && request.method === 'PUT') {
        return await handleUpdateUser(request, env, corsHeaders, userRouteMatch[1]);
      }

      if (userRouteMatch && request.method === 'DELETE') {
        return await handleDeleteUser(request, env, corsHeaders, userRouteMatch[1]);
      }

      return errorResponse('Not Found.', 404, corsHeaders);
    } catch (error) {
      console.error('Worker error:', error);
      return errorResponse('Internal Server Error.', 500, corsHeaders);
    }
  }
};
