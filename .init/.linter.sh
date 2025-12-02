#!/bin/bash
cd /home/kavia/workspace/code-generation/collaborative-task-management-platform-217524-217533/taskboards_frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

