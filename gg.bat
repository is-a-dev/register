:: 文件名：git-sync-push.bat
chcp 65001 > nul

:: 确保当前分支是 main
git branch -M main

:: 显示当前的 Git 状态
git status

:: 将当前目录下的所有更改添加到 Git 的暂存区
git add .

:: 提示用户输入提交信息
set /p message="Enter commit message: "

:: 使用用户输入的提交信息来提交暂存区的更改
git commit -m "%message%"

:: 将本地的提交推送到远程仓库
git push origin main

:: 显示执行 git push 后的 Git 状态
git status

:: 提示操作完成
echo 代码已提交并推送完成！