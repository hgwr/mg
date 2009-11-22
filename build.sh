CHROME=/opt/google/chrome/google-chrome

if [ -d build ]; then
  mkdir build
fi

git-archive --format=tar --prefix=build/mg/ HEAD | tar xvf -
# $CHROME --pack-extension=build/mg --pack-extension-key=../mg.pem
