pipeline {

    agent any

    tools {
        ansible 'ansible'
        terraform 'terraform'
    }

    environment {
        APP_REPO_NAME="babak-todo-app"
        AWS_REGION="us-east-1"
        AWS_ACCOUNT_ID=sh(script:'aws sts get-caller-identity --query Account --output text', returnStdout:true).trim()
        ECR_REGISTRY="${AWS_ACCOUNT_ID}.dkr.ecr.${AWS_REGION}.amazonaws.com"
    }

    stages {
        stage ("Create Infra for the app"){
            steps{
                echo 'Creating Infrastructure for the app on AWS'
                sh 'terraform init -no-color'
                sh 'terraform apply -no-color --auto-approve'
            }
        }


        stage ('Create ECR'){
            steps{
                echo 'Creating ECR for app images'
                sh '''
                aws ecr describe-repositories --region ${AWS_REGION} --repository-name ${APP_REPO_NAME} || \
                aws ecr create-repository \
                    --repository-name ${APP_REPO_NAME} \
                    --image-scanning-configuration scanOnPush=false \
                    --image-tag-mutability IMMUTABLE \
                    --region ${AWS_REGION}
                '''
            }
        } 

        stage ('Build Docker Images'){
            steps{
                echo 'Building app images'

                    script{
                        env.NODE_IP = sh(script:'terraform output -raw node_public_ip', returnStdout:true).trim()
                        
                        env.DB_HOST = sh(script:'terraform output -raw postgre_private_ip', returnStdout:true).trim()
                        
                        env.DB_NAME = sh(script: 'aws --region=us-east-1 ssm get-parameters --names "db_name" --query "Parameters[*].{Value:Value}" --output text', returnStdout:true).trim()

                        env.DB_PASSWORD = sh(script: 'aws --region=us-east-1 ssm get-parameters --names "db_password" --query "Parameters[*].{Value:Value}" --output text', returnStdout:true).trim()
                    }
                sh 'echo ${DB_HOST}'
                sh 'echo ${NODE_IP}'
                sh 'echo ${DB_NAME}'
                sh 'echo ${DB_PASSWORD}'

                sh 'envsubst < node-env-template > ./nodejs/server/.env'
                sh 'cat ./nodejs/server/.env'

                sh 'envsubst < react-env-template > ./react/client/.env'
                sh 'cat ./react/client/.env'

                sh 'docker build -t ${ECR_REGISTRY}/${APP_REPO_NAME}:postgres -f ./postgresql/dockerfile-postgresql .'
                sh 'docker build -t ${ECR_REGISTRY}/${APP_REPO_NAME}:nodejs -f ./nodejs/dockerfile-nodejs .'
                sh 'docker build -t ${ECR_REGISTRY}/${APP_REPO_NAME}:react -f ./react/dockerfile-react .'
            }
        }

        stage ('Push images to ECR'){
            steps{
                echo 'Pushing images to ECR'
                sh 'aws ecr get-login-password --region ${AWS_REGION} | docker login --username AWS --password-stdin "$ECR_REGISTRY"'
                sh 'docker push "$ECR_REGISTRY/$APP_REPO_NAME:postgres"'
                sh 'docker push "$ECR_REGISTRY/$APP_REPO_NAME:nodejs"'
                sh 'docker push "$ECR_REGISTRY/$APP_REPO_NAME:react"'
            }
        }

        stage ('Wait till instances ready'){
            steps{
                script{
                    echo 'Waiting for the instances'

                id_postresql = sh(script: 'aws ec2 describe-instances --filters Name=tag-value,Values=ansible_postgresql Name=instance-state-name,Values=running --query Reservations[*].Instances[*].[InstanceId] --output text',  returnStdout:true).trim()

                sh 'aws ec2 wait instance-status-ok --instance-ids $id_postegresql'

                id_nodejs = sh(script: 'aws ec2 describe-instances --filters Name=tag-value,Values=ansible_nodejs Name=instance-state-name,Values=running --query Reservations[*].Instances[*].[InstanceId] --output text',  returnStdout:true).trim()

                sh 'aws ec2 wait instance-status-ok --instance-ids $id_nodejs'

                id_react = sh(script: 'aws ec2 describe-instances --filters Name=tag-value,Values=ansible_react Name=instance-state-name,Values=running --query Reservations[*].Instances[*].[InstanceId] --output text',  returnStdout:true).trim()

                sh 'aws ec2 wait instance-status-ok --instance-ids $id_react'
                }
            }
        }

        stage ('Deploy the app'){
            steps{
                echo 'Deploying the app...'
                sh 'ls -l'
                sh 'ansible --version'

                ansiblePlaybook credentialsId: 'project-208', disableHostKeyChecking: true, installation: 'ansible', inventory: 'inventory_aws_ec2.yml', playbook: 'docker-project.yml'
            }

        }

        stage ('Destroy the infra'){
            steps{
                timeout(time:5, unit:'DAYS'){
                    input message:'Approve terminate'
                }
                sh """
                docker image prune -af
                terraform destroy -no-color --auto-approve
                aws ecr delete-repository \
                  --repository-name ${APP_REPO_NAME} \
                  --region ${AWS_REGION} \
                  --force
                """
            }
        }
    }

    post {
        always {
            echo 'Deleting all local images'
            sh 'docker image prune -af'
        }

        failure {
            echo 'Delete the Image Repository on ECR due to the Failure'
            sh """
                aws ecr delete-repository \
                  --repository-name ${APP_REPO_NAME} \
                  --region ${AWS_REGION}\
                  --force
                """
            echo 'Deleting Terraform Stack due to the Failure'
            sh 'terraform destroy -no-color --auto-approve'
        }
    }

}