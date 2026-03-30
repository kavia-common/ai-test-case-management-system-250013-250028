#!/bin/bash
cd /home/kavia/workspace/code-generation/ai-test-case-management-system-250013-250028/testcase_backend_api
npm run lint
LINT_EXIT_CODE=$?
if [ $LINT_EXIT_CODE -ne 0 ]; then
  exit 1
fi

