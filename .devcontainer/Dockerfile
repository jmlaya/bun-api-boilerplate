FROM oven/bun:alpine

# Config Bun
ENV PATH="~/.bun/bin:${PATH}"
RUN ln -s /usr/local/bin/bun /usr/local/bin/node

RUN bun install -g @anthropic-ai/claude-code

# Update packages
RUN if [ "alpine" == "alpine" ] ; then apk update ; else apt-get update ; fi

# Install Git
RUN if [ "alpine" == "alpine" ] ; then apk add git ; else apt-get install -y git ; fi

# Install Openssh client
RUN if [ "alpine" == "alpine" ] ; then apk add openssh-client ; else apt-get install -y openssh-client ; fi

RUN bun install -g @anthropic-ai/claude-code

# Set `DEVCONTAINER` environment variable to help with orientation
ENV DEVCONTAINER=true