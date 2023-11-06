/*
 * Copyright 2023 Adobe. All rights reserved.
 * This file is licensed to you under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License. You may obtain a copy
 * of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software distributed under
 * the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 * OF ANY KIND, either express or implied. See the License for the specific language
 * governing permissions and limitations under the License.
 */
import express from 'express';
import dotenv from 'dotenv';
import { render } from '../src/index.js';
import { ensureExpressEnv } from './ensure-env.js';

const dotEnvFile = 'build/.local.env';
dotenv.config({ path: dotEnvFile });
const { AEM_AUTHOR_URL, OWNER, REPO, BRANCH, ACCESS_TOKEN } = process.env;

// ensure env variables are set
try {
  ensureExpressEnv();
} catch (e) {
  // this is used for local development, logging an error instead of throwing is sufficient
  // so devs can use this locally if they dont need working AEM pages.
  console.error(e.message);
}

const app = express();
const port = 3030;

/**
 *
 * @param {import('express').Request} req
 * @param {import('express').Response} res
 * @returns
 */
const handler = async (req, res) => {
  const { path, query } = req;

  const params = {
    ...query,
    aemAuthorUrl: AEM_AUTHOR_URL,
    aemOwner: OWNER,
    aemRepo: REPO,
    aemBranch: BRANCH,
    authorization: `Bearer ${ACCESS_TOKEN}`,
  };

  const { body, headers, md, original, error } = await render(path, params);

  if (error) {
    res.status(error.code || 503);
    res.send(error.message);
    return;
  }
  // set headers as they are.
  Object.entries(headers).forEach(([key, value]) => res.setHeader(key, value));

  res.status(200);
  if (path.endsWith('.md')) {
    res.setHeader('Content-Type', 'text/plain');
    res.send(md);
  } else if (path.endsWith('.original')) {
    res.send(original);
  } else {
    res.send(body);
  }
};

app.get('/**', handler);

app.listen(port, () => console.log(`Converter listening on port ${port}`));
