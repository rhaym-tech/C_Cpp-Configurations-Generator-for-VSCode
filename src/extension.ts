import * as vscode from 'vscode';
import * as fs from 'fs';
import * as path from 'path';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.workspace.onDidOpenTextDocument((document: vscode.TextDocument) => {
    if (isCppOrCFile(document)) {
      generateCppConfigs();
    }
  });

  context.subscriptions.push(disposable);
}

function isCppOrCFile(document: vscode.TextDocument): boolean {
  const languageId = document.languageId;
  return languageId === 'cpp' || languageId === 'c';
}

function generateCppConfigs() {
  const filePath = 'C:\\MinGW\\bin\\launcher.exe';

  // Check if the file exists
  fs.promises.access(filePath, fs.constants.F_OK).then(() => {
      // File exists
    console.log('File exists')

    const tasksConfig = {
      tasks: [
        {
          type: 'cppbuild',
          label: 'builder',
          command: 'C:\\MinGW\\bin\\g++.exe',
          args: [
            '-Wall',
            '-g',
            '${file}',
            '-o',
            '${fileDirname}\\output\\${fileBasenameNoExtension}.exe'
          ],
          options: {
            cwd: '${fileDirname}'
          },
          problemMatcher: [
            '$gcc'
          ],
          group: {
            kind: 'build',
            isDefault: true
          },
          detail: 'Task generated by Debugger.'
        }
      ],
      version: '2.0.0'
    };

    const launchConfig = {
      version: '0.2.0',
      configurations: [
        {
          name: 'Build and Run with Launcher',
          type: 'cppdbg',
          request: 'launch',
          preLaunchTask: 'builder',
          program: filePath,
          args: ['${fileDirname}/output/${fileBasenameNoExtension}.exe'],
          cwd: '${fileDirname}',
          externalConsole: true,
          stopAtEntry: false,
          MIMode: 'gdb'
        }
      ]
    };

    const workspacePath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].name: undefined;

    if (workspacePath) {
      const tasksPath = path.join(workspacePath, '.vscode', 'tasks.json');
      const launchPath = path.join(workspacePath, '.vscode', 'launch.json');

      if (!fs.existsSync(tasksPath)) {
        fs.writeFileSync(tasksPath, JSON.stringify(tasksConfig, null, 2));
      }

      if (!fs.existsSync(launchPath)) {
        fs.writeFileSync(launchPath, JSON.stringify(launchConfig, null, 2));
      }

      vscode.window.showInformationMessage('C/C++ configurations generated successfully!');
    } else {
      vscode.window.showErrorMessage('Cannot find workspace root path.');
    }
  }).catch(() => {
    // File doesn't exist, prompt user with two options
    vscode.window.showInformationMessage(
      'The required launcher.exe file is not found. What would you like to do?',
      { modal: true },
      'Download now',
      'Abort'
    ).then((choice) => {
      if (choice === 'Download now') {
        const downloadUrl = 'https://www.mediafire.com/file/9gqm1ougcwfkru5/C_CPP_CodeRunner.exe';
        vscode.env.openExternal(vscode.Uri.parse(downloadUrl));
      } else if (choice === 'Abort') {
        const tasksConfig = {
          tasks: [
            {
              type: 'cppbuild',
              label: 'builder',
              command: 'C:\\MinGW\\bin\\g++.exe',
              args: [
                '-Wall',
                '-g',
                '${file}',
                '-o',
                '${fileDirname}\\output\\${fileBasenameNoExtension}.exe'
              ],
              options: {
                cwd: '${fileDirname}'
              },
              problemMatcher: [
                '$gcc'
              ],
              group: {
                kind: 'build',
                isDefault: true
              },
              detail: 'Task generated by Debugger.'
            }
          ],
          version: '2.0.0'
        };
    
        const launchConfig = {
          version: '0.2.0',
          configurations: [
            {
              name: 'Build and Run',
              type: 'cppdbg',
              request: 'launch',
              preLaunchTask: 'builder',
              program: "${fileDirname}/output/${fileBasenameNoExtension}.exe",
              args: [],
              cwd: '${fileDirname}',
              externalConsole: true,
              stopAtEntry: false,
              MIMode: 'gdb'
            }
          ]
        };
        const workspacePath = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].name: undefined;
        if (workspacePath) {
          const tasksPath = path.join(workspacePath, '.vscode', 'tasks.json');
          const launchPath = path.join(workspacePath, '.vscode', 'launch.json');
    
          if (!fs.existsSync(tasksPath)) {
            fs.writeFileSync(tasksPath, JSON.stringify(tasksConfig, null, 2));
          }
    
          if (!fs.existsSync(launchPath)) {
            fs.writeFileSync(launchPath, JSON.stringify(launchConfig, null, 2));
          }
    
          vscode.window.showInformationMessage('C/C++ configurations generated successfully!');
        } else {
          vscode.window.showErrorMessage('Cannot find workspace root path.');
        }
      }
    });
  });
}

export function deactivate() { }